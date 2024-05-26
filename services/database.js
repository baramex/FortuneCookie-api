const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'BlastNote',
    password: 'admin',
    port: 5432,
});

pool.on("error", (err) => {
    console.error("[DATABASE] Erreur de connexion", err);
});

module.exports = pool;