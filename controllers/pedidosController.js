// controllers/pedidosController.js
// Cada função aqui atende UMA rota de pedidos: lê o que veio na requisição
// (req), chama o service certo, e decide o que devolver (res) — incluindo
// o status code. Nenhuma query SQL aparece neste arquivo; quem faz isso é
// o service (services/pedidosService.js). Mesmo padrão explicado em
// detalhe em controllers/produtosController.js.

import * as service from '../services/pedidosService.js';

// POST /pedidos
// O corpo já passou pela validação (validarPedido): só cliente_id é
// obrigatório. O status, se não vier, é definido como 'pendente' lá no
// service.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    // 201 Created: convenção HTTP para "algo novo foi criado com sucesso".
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

// GET /pedidos
export async function listar(req, res, next) {
  try {
    const pedidos = await service.listarTodos();
    res.json(pedidos); // 200 OK é o status padrão, não precisa escrever
  } catch (erro) {
    next(erro);
  }
}

// GET /pedidos/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params; // o :id da URL vem aqui
    const pedido = await service.buscarPorId(id);

    if (!pedido) {
      // 404 Not Found: o id é válido como formato, mas não existe no banco
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
}

// PUT /pedidos/:id
// Um pedido já criado só permite mudar o status (ex: de "pendente" para
// "enviado") — não dá pra trocar o cliente ou a data. Por isso essa
// função lê só req.body.status, e não o objeto inteiro, e chama um método
// específico do service: atualizarStatus.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Buscamos o pedido ANTES de tentar atualizar, pra confirmar que ele
    // existe e responder 404 de forma clara.
    const pedidoExistente = await service.buscarPorId(id);
    if (!pedidoExistente) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    await service.atualizarStatus(id, status);
    res.json({ id, status });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /pedidos/:id
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    // Aqui SIM dá pra confiar em affectedRows: um DELETE nunca fica "no
    // meio do caminho" — ou apagou 1 linha, ou apagou 0.
    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // 204 No Content: deu certo, mas não há nada útil pra devolver no
    // corpo da resposta (o pedido não existe mais).
    res.status(204).send();
  } catch (erro) {
    // Se o pedido tiver itens_pedido vinculados, o erro cai aqui —
    // o errorHandler central (index.js) que decide a resposta.
    next(erro);
  }
}
