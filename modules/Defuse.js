const pool = require("../services/Database");

class Defuse {
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS defuses (
            id INTEGER PRIMARY KEY,
            bomb_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            lon DOUBLE PRECISION NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_bomb
                FOREIGN KEY(bomb_id)
                    REFERENCES bombs(id),
            CONSTRAINT fk_user
                FOREIGN KEY(user_id)
                    REFERENCES users(id)
        );`);
    }
}

module.exports = Defuse;