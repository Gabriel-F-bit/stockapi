// services/pedidosService.js
// Camada de acesso a dados: é aqui que a query SQL de fato acontece (ver
// services/produtosService.js para a explicação completa do padrão usado
// em todo o projeto). listarTodos e buscarPorId usam INNER JOIN com
// clientes, pra devolver o NOME do cliente em vez de só o cliente_id —
// isso é seguro porque cliente_id é uma FK obrigatória (todo pedido tem
// que ter um cliente).

import pool from '../config/db.js';

// Cria um pedido novo e devolve o id que o MySQL gerou pra ele. Se o
// status não vier no corpo da requisição, assume 'pendente' como padrão.
export async function criar(pedido) {
  const { cliente_id, status } = pedido;

  const [resultado] = await pool.query(
    'INSERT INTO pedidos (cliente_id, status) VALUES (?, ?)',
    [cliente_id, status || 'pendente']
  );

  return resultado.insertId;
}

// Retorna todos os pedidos, já com o nome do cliente (em vez de só o
// cliente_id) graças ao INNER JOIN.
export async function listarTodos() {
  const [linhas] = await pool.query(
    `SELECT pedidos.id, pedidos.data_pedido, pedidos.status,
            clientes.nome AS cliente
     FROM pedidos
     INNER JOIN clientes
       ON pedidos.cliente_id = clientes.id`
  );
  return linhas;
}

// Busca um pedido específico pelo id, com o nome do cliente incluído. Se
// não existir, devolve undefined (é o controller que decide transformar
// isso em um 404).
export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT pedidos.id, pedidos.data_pedido, pedidos.status,
            clientes.nome AS cliente
     FROM pedidos
     INNER JOIN clientes
       ON pedidos.cliente_id = clientes.id
     WHERE pedidos.id = ?`,
    [id]
  );
  return linhas[0];
}

// Só o status é atualizável — mudar de cliente ou de data não faz
// sentido para um pedido que já existe.
export async function atualizarStatus(id, status) {
  const [resultado] = await pool.query(
    'UPDATE pedidos SET status = ? WHERE id = ?',
    [status, id]
  );
  return resultado.affectedRows;
}

// Remove um pedido. Se houver itens_pedido vinculados a este pedido, o
// MySQL recusa o DELETE (erro ER_ROW_IS_REFERENCED_2) — é a chave
// estrangeira de itens_pedido protegendo a integridade dos dados. Isso é
// esperado, não é um bug: o errorHandler central (index.js) trata esse
// erro e devolve uma mensagem clara.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
  return resultado.affectedRows;
}
