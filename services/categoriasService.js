import pool from "../config/db.js";

export async function criar(categoria) {
    const {nome} = categoria;
    const [r] = await pool.query(
        'INSERT INTO categoria (nome) VALUE(?)',
        [nome]
    )
    return r.insertId;
    
}

export async function listarTodos() {
    const [rows] = await pool.query ('SELECT * FROM categoria');
    return rows;
    
}

export async function buscarPorId(id) {
    const [rows] = await pool.query(
        'SELECT * FROM categoria WHERE id=? ', [id]

    )
    return rows[0];
}


export async function atualizar(id, categoria) {
    const {nome} = categoria;
    const [r] = await pool.query (
        'UPDATE categoria nome=? id=?',
        [nome, id]
    )
    return r.affectedRows;
}

export async function deletar(id) {
    const [r] = await pool.query(
        'DELETE * FROM categoria WHERE id=?', [id]
    )
    return r.affectedRows
}