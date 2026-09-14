// middlewares/validarPedido.js
// Um middleware roda ANTES do controller — explicação completa em
// middlewares/validarProduto.js. Dois middlewares aqui porque criar e
// atualizar pedem coisas diferentes: criar precisa de cliente_id (quem
// está fazendo o pedido); atualizar só muda o status (ex: de "pendente"
// para "enviado").

// Usado na criação (POST /pedidos).
export function validarPedido(req, res, next) {
  const { cliente_id } = req.body;

  // cliente_id precisa existir e ser um número — é a FK que liga o pedido
  // a um cliente já cadastrado.
  if (!cliente_id || typeof cliente_id !== 'number') {
    return res.status(400).json({
      erro: 'cliente_id é obrigatório e deve ser um número',
    });
  }

  // Passou na checagem: segue para o controller.
  next();
}

// Usado na atualização (PUT /pedidos/:id): não pede cliente_id, porque um
// pedido já criado não muda de cliente — só o status é atualizável.
export function validarAtualizacaoPedido(req, res, next) {
  const { status } = req.body;

  // status precisa existir, ser string, e não pode ser só espaços em branco
  if (!status || typeof status !== 'string' || !status.trim()) {
    return res.status(400).json({
      erro: 'status é obrigatório e deve ser um texto',
    });
  }

  next();
}
