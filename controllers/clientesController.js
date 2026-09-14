// controllers/clientesController.js
// Cada função aqui atende UMA rota de clientes: lê o que veio na
// requisição (req), chama o service certo, e decide o que devolver (res) —
// incluindo o status code. Nenhuma query SQL aparece neste arquivo; quem
// faz isso é o service (services/clientesService.js).
//
// Mesmo padrão explicado em detalhe em controllers/produtosController.js:
// toda função recebe (req, res, next), e o "next" só é usado dentro do
// catch — chamar next(erro) manda a execução pro middleware de tratamento
// de erro central, lá no index.js, em vez de cada função decidir sozinha
// como responder um erro 500.

import * as service from '../services/clientesService.js';

// POST /clientes
// Quando essa função é chamada, o corpo da requisição JÁ passou pela
// validação (middlewares/validarCliente.js, aplicado na rota) — não
// precisamos checar de novo se o nome veio certo.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    // 201 Created: convenção HTTP para "algo novo foi criado com sucesso".
    // Devolvemos o cliente criado, incluindo o id que o banco gerou.
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

// GET /clientes
export async function listar(req, res, next) {
  try {
    const clientes = await service.listarTodos();
    res.json(clientes); // 200 OK é o status padrão, não precisa escrever
  } catch (erro) {
    next(erro);
  }
}

// GET /clientes/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params; // o :id da URL vem aqui
    const cliente = await service.buscarPorId(id);

    if (!cliente) {
      // 404 Not Found: o id é válido como formato, mas não existe no banco
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (erro) {
    next(erro);
  }
}

// PUT /clientes/:id
// Diferente de produtos (que usa PATCH), aqui a atualização é COMPLETA:
// o corpo da requisição precisa trazer nome, email e telefone de novo,
// mesmo os que não mudaram — é por isso que validarCliente é usado nas
// duas rotas (criar e atualizar).
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    // Buscamos o cliente ANTES de tentar atualizar, pra confirmar que ele
    // existe e responder 404 de forma clara — em vez de confiar em
    // affectedRows depois (mesmo cuidado explicado em
    // controllers/produtosController.js: se o UPDATE não muda nenhum
    // valor de verdade, o MySQL pode retornar affectedRows = 0 mesmo com o
    // registro existindo).
    const clienteExistente = await service.buscarPorId(id);
    if (!clienteExistente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    await service.atualizar(id, req.body);
    res.json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /clientes/:id
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    // Aqui SIM dá pra confiar em affectedRows: um DELETE nunca fica "no
    // meio do caminho" — ou apagou 1 linha, ou apagou 0.
    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    // 204 No Content: deu certo, mas não há nada útil pra devolver no
    // corpo da resposta (o cliente não existe mais).
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
