// routes/pedidosRoutes.js
import express from 'express';
import * as controller from '../controllers/pedidosController.js';
import { validarPedido, validarAtualizacaoPedido } from '../middlewares/validarPedido.js';

const router = express.Router();

router.post('/pedidos', validarPedido, controller.criar);
router.get('/pedidos', controller.listar);
router.get('/pedidos/:id', controller.buscarPorId);
router.put('/pedidos/:id', validarAtualizacaoPedido, controller.atualizar);
router.delete('/pedidos/:id', controller.deletar);

export default router;
