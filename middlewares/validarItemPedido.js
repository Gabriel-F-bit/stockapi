// middlewares/validarItemPedido.js
// Um middleware roda ANTES do controller — explicação completa em
// middlewares/validarProduto.js. Este arquivo tem DOIS middlewares:
// validarItemPedido (para criar — POST) exige as 2 chaves estrangeiras
// (pedido_id, produto_id) mais quantidade e preço. validarAtualizacaoItemPedido
// (para atualizar — PUT) só exige quantidade e preço — pedido_id e
// produto_id não fazem parte de uma atualização (ver
// services/itensPedidoService.js: um item não troca de pedido ou produto).

// Usado na criação (POST /itens_pedido).
export function validarItemPedido(req, res, next) {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const erros = []; // vamos juntando aqui os problemas encontrados

  // pedido_id precisa existir e ser um número — é a FK que liga esse item
  // a um pedido.
  if (!pedido_id || typeof pedido_id !== 'number') {
    erros.push('pedido_id é obrigatório e deve ser um número');
  }

  // produto_id precisa existir e ser um número — é a FK que liga esse item
  // a um produto.
  if (!produto_id || typeof produto_id !== 'number') {
    erros.push('produto_id é obrigatório e deve ser um número');
  }

  // quantidade precisa ser um número maior que zero (não faz sentido pedir
  // 0 ou -3 unidades de um produto).
  if (!quantidade || typeof quantidade !== 'number' || quantidade <= 0) {
    erros.push('quantidade é obrigatória e deve ser um número maior que zero');
  }

  // preco_unitario precisa ser um número maior que zero, pelo mesmo motivo.
  if (!preco_unitario || typeof preco_unitario !== 'number' || preco_unitario <= 0) {
    erros.push('preco_unitario é obrigatório e deve ser um número maior que zero');
  }

  // Se juntamos pelo menos um erro, a requisição para aqui com 400 Bad
  // Request e a lista de tudo que está errado.
  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  // Passou em todas as checagens: segue para o controller.
  next();
}

// Usado na atualização (PUT /itens_pedido/:id): não pede pedido_id nem
// produto_id porque, uma vez criado, um item não troca de pedido ou de
// produto — só quantidade e preço podem mudar.
export function validarAtualizacaoItemPedido(req, res, next) {
  const { quantidade, preco_unitario } = req.body;
  const erros = [];

  if (!quantidade || typeof quantidade !== 'number' || quantidade <= 0) {
    erros.push('quantidade é obrigatória e deve ser um número maior que zero');
  }

  if (!preco_unitario || typeof preco_unitario !== 'number' || preco_unitario <= 0) {
    erros.push('preco_unitario é obrigatório e deve ser um número maior que zero');
  }

  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  next();
}
