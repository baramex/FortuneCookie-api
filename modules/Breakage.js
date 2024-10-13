const pool = require("../services/database");

// En relation avec les cassages de cookies
class Breakage {
    // Créer la table si elle n'existe pas déjà
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS breakages (
            id SERIAL PRIMARY KEY,
            cookie_id INTEGER UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            lon DOUBLE PRECISION NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_cookie
                FOREIGN KEY(cookie_id)
                    REFERENCES cookies(id),
            CONSTRAINT fk_user
                FOREIGN KEY(user_id)
                    REFERENCES users(id)
        );`);
    }

    // Créer un cassage de cookie dans la base de donnée
    static createBreakage(cookie_id, user_id, lon, lat) {
        return pool.query(`INSERT INTO breakages (cookie_id, user_id, lon, lat) VALUES ($1, $2, $3, $4) RETURNING *`, [cookie_id, user_id, lon, lat]);
    }

    // Récupérer un cassage à partir de son ID
    static getBreakageByCookieId(cookie_id) {
        return pool.query(`SELECT * FROM breakages WHERE cookie_id = $1`, [cookie_id]);
    }

    // Récupérer tous les cassages d'un utilisateur
    static getUserBreakages(user_id) {
        return pool.query("SELECT breakages.id, cookie_id, breakages.user_id, breakages.lon, breakages.lat, cookies.lon AS cookie_lon, cookies.lat AS cookie_lat, breakages.created_at, cookies.created_at AS cookie_created_at, cookies.state AS cookie_state, cookies.message AS cookie_message, cookies.radius AS cookie_radius, cookies.reference AS cookie_reference, reply.id AS reply_id, reply.state AS reply_state, reply.created_at AS replied_at FROM breakages JOIN cookies ON cookies.id = cookie_id LEFT OUTER JOIN cookies reply ON reply.reference = cookie_id WHERE breakages.user_id = $1", [user_id]);
    }
}

module.exports = Breakage;