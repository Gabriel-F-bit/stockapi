// index.js
// Ponto de entrada da aplicação: monta o servidor Express, registra as rotas
// e define o que acontece quando algo foge do caminho esperado (404 e erros).

import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // carrega o .env para dentro de process.env

import produtosRoutes from './routes/produtosRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import itensPedidoRoutes from './routes/itensPedidoRoutes.js';

const app = express();

// --- Middlewares globais (rodam em TODA requisição, nessa ordem) ---
app.use(cors());          // permite que outras origens (ex: um front-end) chamem a API
app.use(express.json());  // permite ler JSON enviado no corpo (req.body)

// Rota simples só para confirmar que o servidor está no ar
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Todas as rotas ficam debaixo do prefixo /api
// (ex: POST /produtos definido em produtosRoutes.js vira POST /api/produtos)
app.use('/api/v1/stockapi', produtosRoutes);
app.use('/api/v1/stockapi', clientesRoutes);
app.use('/api/v1/stockapi', pedidosRoutes);
app.use('/api/v1/stockapi', itensPedidoRoutes);

// --- A partir daqui, só entra quem NÃO encontrou uma rota válida acima ---
// Isso não é um middleware separado nem vem de outro arquivo: é só uma
// função passada direto para app.use(), do mesmo jeito que fizemos em
// Back-end I. Precisa ficar DEPOIS de todas as rotas, senão ela "rouba"
// a requisição antes das rotas de verdade serem testadas.
app.use((req, res) => {
  res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

// --- Tratamento de erros central ---
// Também é só uma função direto aqui, sem arquivo separado. A ÚNICA coisa
// que faz o Express entender que essa função trata ERROS (e não é mais uma
// rota) é ela ter exatamente 4 parâmetros: (erro, req, res, next).
// Se um controller chamar next(erro), a execução pula direto para cá.
app.use((erro, req, res, next) => {
  console.error(erro); // sempre bom logar o erro real no terminal, pra debugar

  // Exemplo de erro específico que vale tratar com uma mensagem melhor:
  // tentar salvar um produto com uma categoria_id que não existe no banco
  // (ou um pedido_id/produto_id inválido em itens_pedido).
  if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'referência inválida — o registro relacionado não existe' });
  }

  // O oposto do erro acima: tentar deletar um registro que ainda é
  // referenciado por outra tabela (ex: um pedido que tem itens_pedido
  // vinculados). O banco recusa a operação para não deixar dados órfãos.
  if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ erro: 'não é possível remover — existem registros vinculados a este' });
  }

  // Qualquer outro erro que não previmos: resposta genérica, sem vazar
  // detalhes internos do servidor para quem fez a requisição.
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));