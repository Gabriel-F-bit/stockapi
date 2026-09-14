// services/clientesService.js
// Mesma responsabilidade dos outros services: só SQL, nada de req/res aqui.

import pool from '../config/db.js';

export async function criar(cliente) {
  const { nome, email, telefone } = cliente;

  const [resultado] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)',
    [nome, email ?? null, telefone ?? null]
  );

  return resultado.insertId;
}

export async function listarTodos() {
  const [linhas] = await pool.query('SELECT * FROM clientes');
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return linhas[0];
}

// PUT — substituição completa: espera nome, email e telefone sempre,
// igual ao padrão já usado em produtos.
export async function atualizar(id, cliente) {
  const { nome, email, telefone } = cliente;

  const [resultado] = await pool.query(
    'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
    [nome, email ?? null, telefone ?? null, id]
  );

  return resultado.affectedRows;
}

export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows;
}
