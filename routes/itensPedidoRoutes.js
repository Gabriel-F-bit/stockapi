// routes/itensPedidoRoutes.js
// Define as URLs da API de itens_pedido (os produtos dentro de um pedido,
// com quantidade e preço) e liga cada uma ao seu controller — e, quando
// precisa validar o corpo da requisição, ao middleware certo antes dele.
// Mesma lógica explicada com mais detalhes em routes/produtosRoutes.js.

import express from 'express';
import * as controller from '../controllers/itensPedidoController.js';
import { validarItemPedido, validarAtualizacaoItemPedido } from '../middlewares/validarItemPedido.js';

const router = express.Router();

// Criar um item exige pedido_id, produto_id, quantidade e preco_unitario —
// é o validarItemPedido que confere tudo isso.
router.post('/itens_pedido', validarItemPedido, controller.criar);

router.get('/itens_pedido', controller.listar);
router.get('/itens_pedido/:id', controller.buscarPorId);

// PUT aqui não deixa trocar o pedido ou o produto de um item já criado —
// só quantidade e preco_unitario podem mudar (ver
// services/itensPedidoService.js). Por isso usa um middleware diferente do
// de criar: validarAtualizacaoItemPedido, que não exige pedido_id nem
// produto_id.
router.put('/itens_pedido/:id', validarAtualizacaoItemPedido, controller.atualizar);

// Deletar não recebe corpo, então não precisa de validação.
router.delete('/itens_pedido/:id', controller.deletar);

// Esse router é importado e "plugado" no app principal, em index.js
// (app.use('/api/v1/stockapi', itensPedidoRoutes)) — é lá que o prefixo
// /api é somado na frente de cada rota definida aqui.
export default router;
