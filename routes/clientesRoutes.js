// routes/clientesRoutes.js
// Define as URLs da API de clientes e liga cada uma ao seu controller — e,
// quando precisa validar o que foi enviado, ao middleware de validação
// antes dele.
//
// Cada linha abaixo é lida assim:
//   router.<verbo>(<caminho>, [middlewares...], controller)
// Os middlewares rodam na ordem em que aparecem, da esquerda pra direita,
// e só passam a vez com next(). O controller é sempre o último da lista.
// (mesma lógica explicada com mais detalhes em routes/produtosRoutes.js)

import express from 'express';
import * as controller from '../controllers/clientesController.js';
import { validarCliente } from '../middlewares/validarCliente.js';

const router = express.Router();

// Criar recebe nome (obrigatório) e email (opcional) no corpo, então passa
// pela validação antes de chegar no controller.
router.post('/clientes', validarCliente, controller.criar);

router.get('/clientes', controller.listar);
router.get('/clientes/:id', controller.buscarPorId);

// PUT, não PATCH: diferente de produtos, aqui a atualização é COMPLETA —
// quem chama a API precisa mandar todos os campos de novo (nome, email,
// telefone), não só o que mudou. Por isso usa o mesmo middleware
// validarCliente usado na criação.
router.put('/clientes/:id', validarCliente, controller.atualizar);

// Deletar não recebe corpo, então não precisa de validação.
router.delete('/clientes/:id', controller.deletar);

// Esse router é importado e "plugado" no app principal, em index.js
// (app.use('/api/v1/stockapi', clientesRoutes)) — é lá que o prefixo /api é
// somado na frente de cada rota definida aqui.
export default router;
