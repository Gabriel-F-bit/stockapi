// controllers/itensPedidoController.js
import * as service from '../services/itensPedidoService.js';

export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    // categoria_id inválido tem tratamento especial no errorHandler;
    // pedido_id/produto_id inválidos aqui caem no mesmo código de erro
    // do MySQL (ER_NO_REFERENCED_ROW_2) e recebem a resposta genérica de
    // erro de referência — dá pra estender o errorHandler se quiser uma
    // mensagem específica para itens_pedido também.
    next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    const itens = await service.listarTodos();
    res.json(itens);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const item = await service.buscarPorId(id);

    if (!item) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    res.json(item);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    const itemExistente = await service.buscarPorId(id);
    if (!itemExistente) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    await service.atualizar(id, req.body);
    res.json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
