

---

## 1. Stack utilizada

| Tecnologia | Papel no projeto |
|---|---|
| Node.js + Express | Framework do servidor HTTP |
| MySQL + mysql2 | Banco de dados relacional e driver de conexão |
| dotenv | Carrega variáveis de ambiente do `.env` |
| cors | Permite que outras origens acessem a API |
| nodemon | Reinicia o servidor automaticamente em desenvolvimento |

---

## 2. Estrutura do projeto

```
stockapi/
├── config/
│   └── db.js                       # conexão (pool) com o MySQL
├── controllers/
│   ├── produtosController.js
│   ├── clientesController.js
│   ├── pedidosController.js
│   └── itensPedidoController.js
├── middlewares/
│   ├── validarProduto.js           # validarProduto + validarAtualizacaoProduto (PATCH)
│   ├── validarCliente.js
│   ├── validarPedido.js            # validarPedido + validarAtualizacaoPedido
│   └── validarItemPedido.js        # validarItemPedido + validarAtualizacaoItemPedido
├── routes/
│   ├── produtosRoutes.js
│   ├── clientesRoutes.js
│   ├── pedidosRoutes.js
│   └── itensPedidoRoutes.js
├── services/
│   ├── produtosService.js
│   ├── clientesService.js
│   ├── pedidosService.js           # listarTodos/buscarPorId usam JOIN com clientes
│   └── itensPedidoService.js
├── database/
│   └── schema.sql                  # cria o banco e as 6 tabelas
├── .env.example                    # modelo de variáveis de ambiente
├── .gitignore
├── index.js                        # ponto de entrada — servidor, rotas, 404 e erro central
├── package.json
└── README.md
```

`notFound` e `errorHandler` **não são arquivos separados** — são definidos direto no `index.js`, do mesmo jeito que vocês já fizeram em Back-end I. Cada tabela tem sua própria validação em `middlewares/`, porque ela é reaproveitável entre rotas diferentes (POST e PUT/PATCH).

Cada pasta tem uma única responsabilidade — é assim que o projeto se mantém organizado conforme cresce:

| Camada | Responsabilidade | Nunca faz |
|---|---|---|
| `routes/` | Define URL + verbo HTTP, liga middleware e controller | Lógica de negócio ou SQL |
| `middlewares/` | Valida, autentica ou intercepta a requisição antes do controller | Montar a resposta final de sucesso |
| `controllers/` | Lê `req`, chama o service, decide o status code da resposta | SQL direto |
| `services/` | Executa queries SQL, retorna dados "crus" | Conhecer `req`/`res` |

---

## 3. Como rodar

```bash
npm install
cp .env.example .env       # depois preencha DB_PASSWORD com a senha do seu MySQL
```

Rode `database/schema.sql` no seu MySQL (cria o banco `stockapi` e as 6 tabelas, na ordem certa por causa das chaves estrangeiras).

```bash
npm run dev                # sobe com nodemon (reinicia sozinho ao salvar)
# ou
npm start                  # sobe sem reiniciar automático
```

Servidor no ar em `http://localhost:3000`.

---

## 4. O fluxo de uma requisição

```
requisição do cliente
        │
        ▼
     routes           → identifica a URL e o verbo (GET, POST, PATCH, DELETE)
        │
        ▼
  middleware de        → só existe em POST e PATCH
  validação (se houver)  se os dados estiverem errados, responde 400 e para aqui
        │
        ▼
    controller         → chama o service e decide o que responder
        │
        ▼
     service           → executa a query SQL e retorna o resultado
        │
        ▼
  controller responde  → JSON + status code
```

Se qualquer coisa der errado no meio do caminho (erro de banco, exceção não prevista), o controller chama `next(erro)` e a resposta é montada pelo **errorHandler**, não pelo controller.

---

## 5. Endpoints

Prefixo de todas as rotas: `/api`

| Método | Rota | Corpo (JSON) | Sucesso | Erros possíveis |
|---|---|---|---|---|
| POST | `/api/produtos` | `{ "nome", "preco", "descricao"?, "quantidade_estoque"?, "categoria_id"? }` — nome e preco obrigatórios | 201 + produto criado | 400 (dados inválidos) |
| GET | `/api/produtos` | — | 200 + lista, **com o nome da categoria via LEFT JOIN** | — |
| GET | `/api/produtos/:id` | — | 200, idem | 404 (não existe) |
| PATCH | `/api/produtos/:id` | Qualquer subconjunto dos campos acima — só o que vier é alterado | 200 + produto atualizado | 400 / 404 |
| DELETE | `/api/produtos/:id` | — | 204 (sem corpo) | 404 (não existe) |
| qualquer | rota que não existe | — | — | 404 (rota não encontrada) |

Exemplo de teste no Postman:

```
POST http://localhost:3000/api/produtos
Content-Type: application/json

{ "nome": "Caderno", "preco": 15.9, "categoria_id": 1 }
```

```
PATCH http://localhost:3000/api/produtos/1
Content-Type: application/json

{ "preco": 18.9 }
```

O segundo exemplo altera **só** o preço — `nome`, `descricao`, `quantidade_estoque` e `categoria_id` continuam exatamente como estavam.

### clientes, pedidos e itens_pedido — PUT simples

Essas três tabelas usam o padrão de PUT (substituição completa) ensinado em aula, não o PATCH parcial de `produtos`:

| Método | Rota | Corpo (JSON) | Sucesso | Erros possíveis |
|---|---|---|---|---|
| POST | `/api/clientes` | `{ "nome", "email"?, "telefone"? }` | 201 | 400 |
| GET | `/api/clientes` | — | 200 + lista | — |
| GET | `/api/clientes/:id` | — | 200 | 404 |
| PUT | `/api/clientes/:id` | `{ "nome", "email"?, "telefone"? }` (substitui tudo) | 200 | 400 / 404 |
| DELETE | `/api/clientes/:id` | — | 204 | 404 |
| POST | `/api/pedidos` | `{ "cliente_id", "status"? }` — status padrão é `pendente` | 201 | 400 |
| GET | `/api/pedidos` | — | 200 + lista, **com o nome do cliente via JOIN** | — |
| GET | `/api/pedidos/:id` | — | 200, idem | 404 |
| PUT | `/api/pedidos/:id` | `{ "status" }` — só o status é atualizável | 200 | 400 / 404 |
| DELETE | `/api/pedidos/:id` | — | 204 | 404, ou 400 se houver `itens_pedido` vinculados |
| POST | `/api/itens_pedido` | `{ "pedido_id", "produto_id", "quantidade", "preco_unitario" }` | 201 | 400 |
| GET | `/api/itens_pedido` | — | 200 + lista, **com nome do produto e status do pedido (2 JOINs)** | — |
| GET | `/api/itens_pedido/:id` | — | 200, idem | 404 |
| PUT | `/api/itens_pedido/:id` | `{ "quantidade", "preco_unitario" }` | 200 | 400 / 404 |
| DELETE | `/api/itens_pedido/:id` | — | 204 | 404 |

---

## 6. Validação de entrada

`middlewares/validarProduto.js` tem **dois** middlewares, com regras diferentes:

- **`validarProduto`** — usado no `POST` (criar). Exige `nome` e `preco`, porque um produto novo precisa nascer com esses dados.
- **`validarAtualizacaoProduto`** — usado no `PATCH` (atualizar). Nenhum campo é obrigatório sozinho, mas pelo menos um precisa vir — e cada campo que vier é validado pelo tipo:

```js
export function validarAtualizacaoProduto(req, res, next) {
  const { nome, preco, quantidade_estoque, categoria_id } = req.body;
  const erros = [];

  const camposEnviados = Object.keys(req.body).filter((c) => CAMPOS_PRODUTO.includes(c));
  if (camposEnviados.length === 0) {
    erros.push('envie pelo menos um campo para atualizar');
  }

  if (nome !== undefined && (typeof nome !== 'string' || !nome.trim())) {
    erros.push('nome, se enviado, deve ser um texto não vazio');
  }
  // ...mais checagens, sempre no formato "se enviado, valida o tipo"

  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }
  next();
}
```

Repare a diferença de padrão: na criação é `if (!nome)` (obrigatório); na atualização é `if (nome !== undefined && ...)` (opcional, mas validado quando presente).

Se `erros` tiver algo, a requisição para ali — o controller nem é chamado. Se estiver tudo certo, `next()` libera a passagem.

---

## 7. PUT x PATCH — por que produtos usa PATCH (e as outras, PUT)

Os dois verbos HTTP existem para atualizar um recurso, mas com sentidos diferentes:

| Verbo | Significado | O cliente manda |
|---|---|---|
| `PUT` | Substituição completa | O recurso inteiro — o que não vier é tratado como removido/resetado |
| `PATCH` | Atualização parcial | Só os campos que quer mudar |

Como queríamos permitir atualizar **um único campo** (ex: só o preço, numa promoção) sem precisar reenviar o produto inteiro, `PATCH` é o verbo tecnicamente correto aqui — é literalmente pra isso que ele foi criado no protocolo HTTP.

### Como o UPDATE parcial funciona por dentro

Como cada requisição pode trazer uma combinação diferente de campos, `services/produtosService.js` monta o `UPDATE` **dinamicamente**, em vez de usar uma query fixa:

```js
const CAMPOS_PRODUTO = ['nome', 'descricao', 'preco', 'quantidade_estoque', 'categoria_id'];

export async function atualizar(id, camposAtualizados) {
  const camposParaAtualizar = Object.keys(camposAtualizados)
    .filter((campo) => CAMPOS_PRODUTO.includes(campo));

  const setClause = camposParaAtualizar.map((campo) => `${campo} = ?`).join(', ');
  const valores = camposParaAtualizar.map((campo) => camposAtualizados[campo]);

  const [resultado] = await pool.query(
    `UPDATE produtos SET ${setClause} WHERE id = ?`,
    [...valores, id]
  );

  return resultado.affectedRows;
}
```

**Isso é seguro contra SQL Injection?** Sim, e vale entender por quê: os *valores* continuam indo por parâmetro (`?`), igual em toda query deste projeto. A única coisa "nova" é que o *nome da coluna* entra direto na string (`${campo}`) — o que normalmente seria perigoso, mas aqui só acontece depois do `.filter()` contra `CAMPOS_PRODUTO`, uma lista fixa definida no código. Não importa o que o cliente mande no corpo da requisição: só um nome de coluna que já está nessa lista consegue chegar até a query. Se alguém mandar `{ "id": 999, "DROP TABLE produtos": true }`, esses campos são simplesmente descartados no `.filter()`.

**Por que só produtos usa esse padrão?** Porque essa técnica (SQL dinâmico) é mais avançada do que o resto do conteúdo do curso. `clientes`, `pedidos` e `itens_pedido` usam UPDATE fixo com PUT — o cliente sempre manda os campos completos, sem a complexidade de montar a query em tempo de execução. Nada impede de aplicar PATCH também nessas tabelas depois, seguindo o mesmo molde desta seção.

---

## 8. Tratamento de erros

`notFound` e `errorHandler` não têm arquivo próprio — são definidos direto no `index.js`, exatamente como em Back-end I. São só funções passadas para `app.use()`, registradas **por último** (a ordem importa):

```js
app.use('/api', produtosRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não encontrada` });
});

app.use((erro, req, res, next) => {
  console.error(erro);

  // Exemplo de erro específico tratado com mensagem melhor: uma FK
  // enviada não existe (categoria_id, cliente_id, pedido_id, produto_id...).
  if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'referência inválida — o registro relacionado não existe' });
  }

  // O oposto: tentar deletar um registro que ainda é referenciado por
  // outra tabela (ex: um pedido que tem itens_pedido vinculados). O banco
  // recusa a operação para não deixar dados órfãos.
  if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ erro: 'não é possível remover — existem registros vinculados a este' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
});
```

- **1º `app.use`** — se a requisição chegou até aqui, é porque nenhuma rota cadastrada bateu com ela. Responde 404.
- **2º `app.use`** — o middleware de erro do Express. A única coisa que faz o Express reconhecer essa função como tratamento de erro (e não mais uma rota) é ela ter exatamente **4 parâmetros**: `(erro, req, res, next)`. Sempre que um controller chama `next(erro)`, a execução pula direto para cá.

Os controllers nunca respondem 500 diretamente — todo `catch` chama `next(erro)` e deixa esse middleware decidir.

---

## 9. Um bug sutil: UPDATE e `affectedRows`

No `controllers/produtosController.js`, o `atualizar` busca o produto (`buscarPorId`) **antes** de atualizar, em vez de checar `affectedRows` depois:

```js
const produtoExistente = await service.buscarPorId(id);
if (!produtoExistente) {
  return res.status(404).json({ erro: 'Produto não encontrado' });
}
await service.atualizar(id, req.body);
```

**Por quê:** se o UPDATE não muda nenhum valor (os dados enviados são idênticos aos já salvos), o MySQL retorna `affectedRows = 0` mesmo com o registro existindo. Se o 404 dependesse só disso, um UPDATE "sem mudanças" pareceria um erro. No `deletar`, esse problema não existe — um DELETE sempre afeta 0 ou 1 linha, sem ambiguidade.

O mesmo cuidado foi replicado em `clientesController.js` e `itensPedidoController.js`. Em `pedidosController.js` também — o `atualizar` busca o pedido antes de chamar `atualizarStatus`.

---

## 10. Status codes usados

| Código | Nome | Quando aparece |
|---|---|---|
| 200 | OK | Leitura ou atualização com sucesso |
| 201 | Created | Produto criado |
| 204 | No Content | Produto removido (sem corpo de resposta) |
| 400 | Bad Request | Validação falhou, ou erro de chave estrangeira |
| 404 | Not Found | Produto ou rota não encontrados |
| 500 | Server Error | Erro inesperado (banco fora do ar, bug, etc.) |

---

## 11. Erros comuns ao rodar

| Erro | Causa provável |
|---|---|
| `ECONNREFUSED` | MySQL não está rodando, ou host/porta errados no `.env` |
| `ER_ACCESS_DENIED_ERROR` | Usuário ou senha incorretos no `.env` |
| `ER_BAD_DB_ERROR` | O banco `stockapi` ainda não foi criado — rode `database/schema.sql` |
| `ER_NO_REFERENCED_ROW_2` | Uma FK enviada (categoria_id, cliente_id, pedido_id, produto_id) não existe |
| `ER_ROW_IS_REFERENCED_2` | Tentativa de deletar um registro que ainda tem outro apontando para ele (ex: pedido com itens_pedido) |

---

## 12. Comparando as 4 tabelas implementadas

Cada tabela tem uma particularidade — o objetivo de implementar as 4 é ver o mesmo padrão se ajustando a situações diferentes:

| Tabela | Chaves estrangeiras | JOIN na leitura? | Verbo de atualização | Particularidade |
|---|---|---|---|---|
| `produtos` | 1 (`categoria_id`, opcional) | LEFT JOIN com `categorias` | PATCH (parcial) | categoria_id aceita NULL — por isso LEFT, não INNER |
| `clientes` | nenhuma | — | PUT (completo) | O CRUD mais simples do projeto |
| `pedidos` | 1 (`cliente_id`) | INNER JOIN com `clientes` | PUT, só do `status` | `deletar` pode ser bloqueado por FK |
| `itens_pedido` | 2 (`pedido_id`, `produto_id`) | INNER JOIN duplo (`produtos` + `pedidos`) | PUT, só de `quantidade`/`preco_unitario` | Tabela associativa — resolve o N:N entre pedidos e produtos |

> **INNER JOIN x LEFT JOIN:** a regra prática é simples — se a FK pode ser `NULL` (como `produtos.categoria_id`), use `LEFT JOIN`, senão um registro "órfão" desaparece silenciosamente da lista. Se a FK é sempre obrigatória na prática (como `pedidos.cliente_id`, ou as duas FKs de `itens_pedido`, sempre exigidas pela validação), `INNER JOIN` é seguro e mais direto.

Se for criar uma tabela nova a partir daqui, o roteiro de sempre continua valendo:

1. `services/<entidade>Service.js` — as 5 funções (`criar`, `listarTodos`, `buscarPorId`, `atualizar`, `deletar`)
2. `middlewares/validar<Entidade>.js` — validação de criação e, se fizer sentido, de atualização
3. `controllers/<entidade>Controller.js` — sempre com `next(erro)` no catch, nunca `res.status(500)` direto
4. `routes/<entidade>Routes.js` — aplique o middleware de validação certo em cada rota
5. Registre a rota nova em `index.js`, **antes** dos dois `app.use` finais (404 e erro central)

O 404 e o tratamento de erro central não precisam de nada novo — eles já cobrem qualquer rota adicionada, desde que continuem sendo os dois últimos `app.use` do arquivo.
