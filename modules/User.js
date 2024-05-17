const pool = require("../services/Database");

class User {
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            remaining_bombs INTEGER DEFAULT 3,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    }
}

module.exports = User;