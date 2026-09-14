// services/itensPedidoService.js
// Camada de acesso a dados: é aqui que a query SQL de fato acontece (ver
// services/produtosService.js para a explicação completa do padrão usado
// em todo o projeto). itens_pedido tem DUAS chaves estrangeiras
// (pedido_id, produto_id). Cada linha representa "esse produto está
// nesse pedido, nessa quantidade, a esse preço".

import pool from '../config/db.js';

// Cria um item de pedido novo e devolve o id que o MySQL gerou pra ele.
export async function criar(item) {
  const { pedido_id, produto_id, quantidade, preco_unitario } = item;

  const [resultado] = await pool.query(
    `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
     VALUES (?, ?, ?, ?)`,
    [pedido_id, produto_id, quantidade, preco_unitario]
  );

  return resultado.insertId;
}

// listarTodos e buscarPorId usam DOIS JOINs — itens_pedido tem duas FKs
// (pedido_id, produto_id), então mostrar só os ids não diria muito.
// Aqui INNER JOIN é seguro nos dois casos: validarItemPedido já exige
// pedido_id e produto_id em toda criação, e a FK do banco garante que,
// se a linha existe, os dois relacionamentos existem também.
export async function listarTodos() {
  const [linhas] = await pool.query(
    `SELECT itens_pedido.id, itens_pedido.quantidade, itens_pedido.preco_unitario,
            produtos.nome AS produto,
            pedidos.id AS pedido_numero, pedidos.status AS pedido_status
     FROM itens_pedido
     INNER JOIN produtos ON itens_pedido.produto_id = produtos.id
     INNER JOIN pedidos ON itens_pedido.pedido_id = pedidos.id`
  );
  return linhas;
}

// Busca um item específico pelo id, com o nome do produto e os dados do
// pedido incluídos. Se não existir, devolve undefined (é o controller que
// decide transformar isso em um 404).
export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT itens_pedido.id, itens_pedido.quantidade, itens_pedido.preco_unitario,
            produtos.nome AS produto,
            pedidos.id AS pedido_numero, pedidos.status AS pedido_status
     FROM itens_pedido
     INNER JOIN produtos ON itens_pedido.produto_id = produtos.id
     INNER JOIN pedidos ON itens_pedido.pedido_id = pedidos.id
     WHERE itens_pedido.id = ?`,
    [id]
  );
  return linhas[0];
}

// Só quantidade e preco_unitario são atualizáveis — trocar o pedido ou
// o produto de um item já criado não faz sentido (seria melhor deletar
// e criar de novo).
export async function atualizar(id, item) {
  const { quantidade, preco_unitario } = item;

  const [resultado] = await pool.query(
    'UPDATE itens_pedido SET quantidade = ?, preco_unitario = ? WHERE id = ?',
    [quantidade, preco_unitario, id]
  );

  return resultado.affectedRows;
}

// Remove um item de pedido. affectedRows diz quantas linhas foram
// apagadas: 1 se existia, 0 se não existia.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM itens_pedido WHERE id = ?', [id]);
  return resultado.affectedRows;
}
