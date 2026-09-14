// middlewares/validarCliente.js
// clientes não tem chave estrangeira, então a validação é a mais simples
// do projeto: só nome é obrigatório. email é opcional, mas se vier tem
// que ser um texto de verdade.

export function validarCliente(req, res, next) {
  const { nome, email } = req.body;
  const erros = [];

  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    erros.push('nome é obrigatório e deve ser um texto');
  }

  if (email !== undefined && email !== null && (typeof email !== 'string' || !email.trim())) {
    erros.push('email, se enviado, deve ser um texto não vazio');
  }

  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  next();
}
