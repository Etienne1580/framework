const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'frameworks',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a MariaDB:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a MariaDB (Base de datos: frameworks)');
    connection.release();
});

// Manejo de errores centralizado: si es una violación de UNIQUE (registro
// duplicado) responde 409 con un mensaje claro; cualquier otro error de BD
// responde 500. Evita repetir el mismo if/else en cada endpoint.
function manejarErrorDb(err, res, mensajeDuplicado) {
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: mensajeDuplicado });
    }
    return res.status(500).json({ success: false, message: err.message });
}

// 1. LOGIN
app.post('/api/login', (req, res) => {
    const { nombre, clave } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE nombreUsuarios = ? AND claveUsuarios = ?';

    db.query(sql, [nombre, clave], (err, results) => {
        if (err) return manejarErrorDb(err, res, '');
        if (results.length > 0) {
            const user = results[0];
            const userAgent = req.headers['user-agent'] || '';
            const so = userAgent.includes('Win') ? 'Windows' :
                userAgent.includes('Mac') ? 'macOS' : 'Linux';

            db.query(
                'INSERT INTO bitacora (fechaHoraBitacora, soBitacora, idUsuarioBitacora) VALUES (NOW(), ?, ?)',
                [so, user.idUsuarios],
                (errBitacora) => {
                    if (errBitacora) console.error('Error registrando bitácora:', errBitacora.message);
                }
            );

            res.json({ success: true, usuario: user });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
});

// 2. REGISTRO (Solo usuario y clave, privilegios = 0 por defecto)
app.post('/api/registro', (req, res) => {
    const { nombre, clave } = req.body;
    const sql = 'INSERT INTO usuarios (nombreUsuarios, claveUsuarios, privilegiosUsuarios) VALUES (?, ?, 0)';

    db.query(sql, [nombre, clave], (err, result) => {
        if (err) return manejarErrorDb(err, res, `Ya existe un usuario llamado "${nombre}".`);
        res.json({ success: true, idUsuarios: result.insertId });
    });
});

// 3. OBTENER LISTA DE DATOS (Para el Dashboard)
app.get('/api/datos', (req, res) => {
    db.query('SELECT * FROM datos', (err, results) => {
        if (err) return manejarErrorDb(err, res, '');
        res.json(results);
    });
});

// 4. OBTENER UN DATO POR ID (Para Desplegar / Editar)
app.get('/api/datos/:id', (req, res) => {
    db.query('SELECT * FROM datos WHERE idDatos = ?', [req.params.id], (err, results) => {
        if (err) return manejarErrorDb(err, res, '');
        if (results.length > 0) res.json(results[0]);
        else res.status(404).json({ message: 'Dato no encontrado' });
    });
});

// 5. AGREGAR NUEVO DATO
app.post('/api/datos', (req, res) => {
    const { nombreDatos, edadDatos, sexoDatos, fechaNacimientoDatos, correoDatos } = req.body;
    const sql = 'INSERT INTO datos (nombreDatos, edadDatos, sexoDatos, fechaNacimientoDatos, correoDatos) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [nombreDatos, edadDatos, sexoDatos, fechaNacimientoDatos, correoDatos], (err, result) => {
        if (err) return manejarErrorDb(err, res, `Ya existe una persona registrada con el correo "${correoDatos}".`);
        res.json({ success: true, idDatos: result.insertId });
    });
});

// 6. EDITAR DATO
app.put('/api/datos/:id', (req, res) => {
    const { nombreDatos, edadDatos, sexoDatos, fechaNacimientoDatos, correoDatos } = req.body;
    const sql = 'UPDATE datos SET nombreDatos=?, edadDatos=?, sexoDatos=?, fechaNacimientoDatos=?, correoDatos=? WHERE idDatos=?';

    db.query(sql, [nombreDatos, edadDatos, sexoDatos, fechaNacimientoDatos, correoDatos, req.params.id], (err, result) => {
        if (err) return manejarErrorDb(err, res, `Ya existe otra persona registrada con el correo "${correoDatos}".`);
        res.json({ success: true });
    });
});

// 7. ELIMINAR DATO
app.delete('/api/datos/:id', (req, res) => {
    db.query('DELETE FROM datos WHERE idDatos = ?', [req.params.id], (err, result) => {
        if (err) return manejarErrorDb(err, res, '');
        res.json({ success: true });
    });
});

// 8. CREAR USUARIO ADMIN (Desde pantalla Nuevo Usuario con Privilegios)
app.post('/api/admin/usuarios', (req, res) => {
    const { nombre, clave, privilegios } = req.body;
    const sql = 'INSERT INTO usuarios (nombreUsuarios, claveUsuarios, privilegiosUsuarios) VALUES (?, ?, ?)';

    db.query(sql, [nombre, clave, privilegios], (err, result) => {
        if (err) return manejarErrorDb(err, res, `Ya existe un usuario llamado "${nombre}".`);
        res.json({ success: true, idUsuarios: result.insertId });
    });
});

// 9. OBTENER BITÁCORA
app.get('/api/bitacora', (req, res) => {
    const sql = `
    SELECT b.idBitacora, b.fechaHoraBitacora, b.soBitacora, u.nombreUsuarios 
    FROM bitacora b 
    JOIN usuarios u ON b.idUsuarioBitacora = u.idUsuarios 
    ORDER BY b.fechaHoraBitacora DESC
  `;
    db.query(sql, (err, results) => {
        if (err) return manejarErrorDb(err, res, '');
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor intermediario corriendo en http://localhost:${PORT}`);
});
