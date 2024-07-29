const pool = require("../services/database");
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

    static getId(id, user_id) {
        return id === "@me" ? user_id : Number(id);
    }

    static validateUsername(username) {
        return /[0-9A-z_]{3,32}/.test(username);
    }

    static getUserByToken(token) {
        return pool.query(`SELECT * FROM users WHERE token = $1`, [token]);
    }

    static async createUser(username) {
        if (!this.validateUsername(username)) {
            throw new Error("Nom d'utilisateur invalide");
        }
        const token = tokgen.generate();
        return pool.query(`INSERT INTO users (token, username) VALUES ($1, $2) RETURNING *`, [token, username]);
    }

    static decreaseBombs(user_id) {
        return pool.query(`UPDATE users SET remaining_bombs = remaining_bombs - 1 WHERE id = $1 RETURNING *`, [user_id]);
    }
}

module.exports = User;