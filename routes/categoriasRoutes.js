import express from "express";
import * as controller from "../controllers/categoriasController.js"
import { validarCategoria } from "../middlewares/validarCategorias.js";

const router = express.Router()

router.post("/categorias", validarCategoria, controller.criar)
router.get("/categorias", controller.listarTodos)
router.get("/categorias/:id",controller.buscarPorId)
router.put("/categorias/:id", validarCategoria, controller.atualizar)
router.delete("/categorias/:id", controller.deletar)

export default router;