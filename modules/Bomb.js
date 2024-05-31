const pool = require("../services/Database");
const Defuse = require("./Defuse");
const Location = require("./Location");
const User = require("./user");

class Bomb {
    static states = {
        ACTIVE: 1,
        DEFUSED: 2
    };

    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS bombs (
            id SERIAL PRIMARY KEY,
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

    static async createBomb(lon, lat, message, user_id) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        const b = await pool.query(`INSERT INTO bombs (state, lon, lat, message, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [this.states.ACTIVE, lon, lat, message, user_id]);
        await User.decreaseBombs(user_id);
        return b;
    }

    static async defuseBomb(bomb_id, lon, lat, user_id) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        const bomb = await pool.query(`SELECT * FROM bombs WHERE id = $1`, [bomb_id]);
        if (bomb.rowCount < 1) {
            throw new Error("Bombe inexistante");
        }
        if (bomb.rows[0].state === this.states.DEFUSED) {
            throw new Error("Bombe déjà désamorcée");
        }
        if (bomb.rows[0].user_id === user_id) {
            throw new Error("Vous ne pouvez pas désamorcer votre propre bombe");
        }
        await Defuse.createDefuse(bomb_id, user_id, lon, lat);
        return pool.query(`UPDATE bombs SET state = $1 WHERE id = $2 RETURNING *`, [this.states.DEFUSED, bomb_id]);
    }

    static async getBombs(lon, lat) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        return pool.query(`SELECT * FROM bombs WHERE state = $1 AND acos(sin(radians($3)) * sin(radians(lat)) + cos(radians($3)) * cos(radians(lat)) * cos(radians(lon) - radians($2))) * 6371 <= $4`, [this.states.ACTIVE, lon, lat, 0.5]);
    }

    static getUserBombs(user_id) {
        return pool.query(`SELECT * FROM bombs WHERE user_id = $1`, [user_id]);
    }
}

module.exports = Bomb;