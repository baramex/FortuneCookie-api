const pool = require("../services/Database");
const tokgen = new (require("uuid-token-generator"))(512);

class User {
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(32) UNIQUE NOT NULL,
            remaining_bombs SMALLINT DEFAULT 3,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    }

    static validateUsername(username) {
        return /([0-9]|[a-Z]|_){3,32}/.test(username);
    }

    static getUserByToken(token) {
        return pool.query(`SELECT * FROM users WHERE token = $1`, [token]);
    }

    static createUser(username) {
        if (!this.validateUsername(username)) {
            return Promise.reject("Nom d'utilisateur invalide");
        }
        const token = tokgen.generate();
        return pool.query(`INSERT INTO users (token, username) VALUES ($1, $2) RETURNING *`, [token, username]);
    }
}

module.exports = User;