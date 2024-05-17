const pool = require("../services/Database");

class Bomb {
    static states = {
        ACTIVE: 1,
        DEFUSED: 2
    };
    
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS bombs (
            id INTEGER PRIMARY KEY,
            state SMALLINT NOT NULL,
            lon DOUBLE PRECISION NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            message VARCHAR(4096) NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_user
                FOREIGN KEY(user_id)
                    REFERENCES users(id)
        );`);
    }
}

module.exports = Bomb;