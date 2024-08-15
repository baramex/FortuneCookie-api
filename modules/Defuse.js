const pool = require("../services/database");

class Defuse {
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS defuses (
            id SERIAL PRIMARY KEY,
            bomb_id INTEGER UNIQUE NOT NULL,
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

    static createDefuse(bomb_id, user_id, lon, lat) {
        return pool.query(`INSERT INTO defuses (bomb_id, user_id, lon, lat) VALUES ($1, $2, $3, $4) RETURNING *`, [bomb_id, user_id, lon, lat]);
    }

    static getDefuseByBombId(bomb_id) {
        return pool.query(`SELECT * FROM defuses WHERE bomb_id = $1`, [bomb_id]);
    }

    static getUserDefuses(user_id) {
        return pool.query("SELECT defuses.id, bomb_id, defuses.user_id, defuses.lon, defuses.lat, bombs.lon AS bomb_lob, bombs.lat AS bomb_lat, defuses.created_at, bombs.created_at AS bomb_created_at, state AS bomb_state, message AS bomb_message, radius AS bomb_radius, reference AS bomb_reference FROM defuses JOIN bombs WHERE user_id = $1", [user_id]);
    }
}

module.exports = Defuse;