import * as service from '../services/categoriasService.js' 

export async function criar(req, res, next) {
    try{
        const id = await service.criar(req.body);

        res.status(201).json({id, ...req.body})

    }catch(erro){
        next(erro);
    }
}

export async function listarTodos(req, res, next)  {
    try{
        const categoria = await service.listarTodos()
        res.status(200).json(categoria)

    }catch(erro){
        next(erro);
    }
}

export async function buscarPorId(req, res, next) {
    try{
        const {id} = req.params;
        const categoria = await service.buscarPorId(id)
        if(!categoria){
            res.status(404).json({ erro: "categoria inválida"})
        }
        res.json(categoria)

    }catch(erro){
        next(erro);
    }
}

export async function atualizar(req, res, next) {
    try{
        const {id} = req.params
        const categoriaExiste = await service.buscarPorId()
        if(!categoriaExiste){
            res.status(404).json({erro: "categoria não encontrada"})
        } 
        await service.atualizar(id, req.body)
        res.json(id, ...req.body)


    }catch(erro){
        next(erro);
    }
}

export async function deletar(req, res, next) {
    try{
        const {id} = req.params
        const linhasremovidas = await service.deletar(id)
        if(!linhasremovidas === 0){
            res.status(404).json({erro: "categoria não existe"})
        }
        
        res.status(204).send()
    }catch(erro){
        next(erro);
    }
}