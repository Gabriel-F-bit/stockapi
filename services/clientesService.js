// services/clientesService.js
// Camada de acesso a dados: é aqui que a query SQL de fato acontece. Cada
// função faz uma operação só e devolve o resultado "cru" — quem decide o
// que fazer com esse resultado (status code, formato da resposta) é o
// controller (ver services/produtosService.js para a explicação completa
// do padrão usado em todo o projeto).

import pool from '../config/db.js';

// Cria um cliente novo e devolve o id que o MySQL gerou pra ele.
export async function criar(cliente) {
  const { nome, email, telefone } = cliente;

  // Os "?" são placeholders: o mysql2 substitui cada um pelo valor
  // correspondente do array, escapando o conteúdo automaticamente — nunca
  // monte a query concatenando strings, isso abre brecha para SQL Injection.
  const [resultado] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)',
    [nome, email ?? null, telefone ?? null]
  );

  // resultado.insertId é o id gerado automaticamente pelo AUTO_INCREMENT
  return resultado.insertId;
}

// Retorna todos os clientes cadastrados.
export async function listarTodos() {
  const [linhas] = await pool.query('SELECT * FROM clientes');
  return linhas;
}

// Busca um cliente específico pelo id. Se não existir, devolve undefined
// (é o controller que decide transformar isso em um 404).
export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return linhas[0];
}

// PUT — substituição completa: espera nome, email e telefone sempre,
// mesmo os que não mudaram (diferente do PATCH usado em produtos, que
// aceita atualização parcial).
export async function atualizar(id, cliente) {
  const { nome, email, telefone } = cliente;

  const [resultado] = await pool.query(
    'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
    [nome, email ?? null, telefone ?? null, id]
  );

  return resultado.affectedRows;
}

// Remove um cliente. affectedRows diz quantas linhas foram apagadas: 1 se
// existia, 0 se não existia.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows;
}
