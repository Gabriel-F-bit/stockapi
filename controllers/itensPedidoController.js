// controllers/itensPedidoController.js
// Cada função aqui atende UMA rota de itens_pedido (os produtos dentro de
// um pedido, com quantidade e preço): lê o que veio na requisição (req),
// chama o service certo, e decide o que devolver (res) — incluindo o
// status code. Nenhuma query SQL aparece neste arquivo; quem faz isso é o
// service (services/itensPedidoService.js). Mesmo padrão explicado em
// detalhe em controllers/produtosController.js.

import * as service from '../services/itensPedidoService.js';

// POST /itens_pedido
// O corpo já passou pela validação (validarItemPedido): pedido_id,
// produto_id, quantidade e preco_unitario são todos obrigatórios.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    // 201 Created: convenção HTTP para "algo novo foi criado com sucesso".
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

// GET /itens_pedido
export async function listar(req, res, next) {
  try {
    const itens = await service.listarTodos();
    res.json(itens); // 200 OK é o status padrão, não precisa escrever
  } catch (erro) {
    next(erro);
  }
}

// GET /itens_pedido/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params; // o :id da URL vem aqui
    const item = await service.buscarPorId(id);

    if (!item) {
      // 404 Not Found: o id é válido como formato, mas não existe no banco
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    res.json(item);
  } catch (erro) {
    next(erro);
  }
}

// PUT /itens_pedido/:id
// Só quantidade e preco_unitario podem ser alterados — trocar o pedido ou
// o produto de um item já criado não faz sentido (o jeito certo seria
// deletar e criar de novo). Por isso usa um middleware de validação
// diferente do de criar: validarAtualizacaoItemPedido.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    // Buscamos o item ANTES de tentar atualizar, pra confirmar que ele
    // existe e responder 404 de forma clara.
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

// DELETE /itens_pedido/:id
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    // Aqui SIM dá pra confiar em affectedRows: um DELETE nunca fica "no
    // meio do caminho" — ou apagou 1 linha, ou apagou 0.
    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    // 204 No Content: deu certo, mas não há nada útil pra devolver no
    // corpo da resposta (o item não existe mais).
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
