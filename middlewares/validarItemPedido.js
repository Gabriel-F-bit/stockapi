// middlewares/validarItemPedido.js
// validarItemPedido (criar) exige as 2 FKs mais quantidade e preço.
// validarAtualizacaoItemPedido (atualizar) só exige quantidade e preço —
// pedido_id e produto_id não fazem parte de uma atualização.

export function validarItemPedido(req, res, next) {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const erros = [];

  if (!pedido_id || typeof pedido_id !== 'number') {
    erros.push('pedido_id é obrigatório e deve ser um número');
  }

  if (!produto_id || typeof produto_id !== 'number') {
    erros.push('produto_id é obrigatório e deve ser um número');
  }

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
