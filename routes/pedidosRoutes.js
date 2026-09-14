// routes/pedidosRoutes.js
// Define as URLs da API de pedidos e liga cada uma ao seu controller — e,
// quando precisa validar o corpo da requisição, ao middleware certo antes
// dele. Mesma lógica explicada com mais detalhes em routes/produtosRoutes.js:
// os middlewares rodam da esquerda pra direita e só passam a vez com
// next(); o controller é sempre o último da lista.

import express from 'express';
import * as controller from '../controllers/pedidosController.js';
import { validarPedido, validarAtualizacaoPedido } from '../middlewares/validarPedido.js';

const router = express.Router();

// Criar um pedido só exige cliente_id — é o validarPedido que confere isso.
router.post('/pedidos', validarPedido, controller.criar);

router.get('/pedidos', controller.listar);
router.get('/pedidos/:id', controller.buscarPorId);

// PUT aqui não substitui o pedido inteiro: um pedido não deixa trocar de
// cliente ou de data depois de criado, então a única "atualização"
// possível é o status (ex: de "pendente" para "enviado"). Por isso usa um
// middleware diferente do de criar: validarAtualizacaoPedido, que só exige
// o campo status.
router.put('/pedidos/:id', validarAtualizacaoPedido, controller.atualizar);

// Deletar não recebe corpo, então não precisa de validação. Repare que,
// se o pedido tiver itens_pedido vinculados, o próprio banco recusa a
// remoção (ver services/pedidosService.js).
router.delete('/pedidos/:id', controller.deletar);

// Esse router é importado e "plugado" no app principal, em index.js
// (app.use('/api/v1/stockapi', pedidosRoutes)) — é lá que o prefixo /api é
// somado na frente de cada rota definida aqui.
export default router;
