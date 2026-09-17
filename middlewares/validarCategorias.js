export async function validarCategoria(req, res, next) {
    const {nome} = req.body;
    const erros = []

    if(!nome || typeof nome !== 'string' || nome.trim()){
        erros.push("o nome é obrigatório e deve ser um texto")
    }
    if(erros.length > 0){
        return res.status(400).json({erros})
    }
    next()
}