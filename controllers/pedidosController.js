// controllers/pedidosController.js
import * as service from '../services/pedidosService.js';

export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    const pedidos = await service.listarTodos();
    res.json(pedidos);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = await service.buscarPorId(id);

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    // Se o pedido tiver itens_pedido vinculados, o erro cai aqui —
    // o errorHandler central (index.js) que decide a resposta.
    next(erro);
  }
}
