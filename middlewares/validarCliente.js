// middlewares/validarCliente.js
// Um middleware roda ANTES do controller — explicação completa de como
// isso funciona em middlewares/validarProduto.js. Se encontrar um
// problema, esta função responde direto com 400 e NÃO chama next(): a
// requisição para aqui e o controller nunca roda. Se estiver tudo certo,
// chama next() e o Express segue em frente.
//
// clientes não tem chave estrangeira, então a validação é a mais simples
// do projeto: só nome é obrigatório. email é opcional, mas se vier tem
// que ser um texto de verdade.

export function validarCliente(req, res, next) {
  const { nome, email } = req.body;
  const erros = []; // vamos juntando aqui os problemas encontrados

  // nome precisa existir, ser string, e não pode ser só espaços em branco
  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    erros.push('nome é obrigatório e deve ser um texto');
  }

  // email é opcional (pode não vir, ou vir null) — mas SE vier, precisa
  // ser um texto não vazio.
  if (email !== undefined && email !== null && (typeof email !== 'string' || !email.trim())) {
    erros.push('email, se enviado, deve ser um texto não vazio');
  }

  // Se juntamos pelo menos um erro, a requisição para aqui com 400 Bad
  // Request e a lista de tudo que está errado.
  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  // Passou em todas as checagens: segue para o controller.
  next();
}
