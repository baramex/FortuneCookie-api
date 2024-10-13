const Pool = require('pg').Pool;

// Se connecter à la base de donnée
const pool = new Pool({
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_password,
    port: process.env.db_port,
});

pool.on("error", (err) => {
    console.error("[DATABASE] Erreur de connexion", err);
});

module.exports = pool;