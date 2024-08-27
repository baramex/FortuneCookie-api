const pool = require("../services/database");
const Defuse = require("./Defuse");
const Location = require("./Location");
const User = require("./User");

class Bomb {
    static states = {
        ACTIVE: 1,
        DEFUSED: 2,
        REPLIED: 3
    };

    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS bombs (
            id SERIAL PRIMARY KEY,
            state SMALLINT NOT NULL,
            lon DOUBLE PRECISION NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            message VARCHAR(4096) NOT NULL,
            user_id INTEGER NOT NULL,
            radius REAL DEFAULT 0.05 NOT NULL,
            reference INTEGER DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_user
                FOREIGN KEY(user_id)
                    REFERENCES users(id),
            CONSTRAINT fk_reference
                FOREIGN KEY(reference)
                    REFERENCES bombs(id)
        );`);
    }

    static async createBomb(lon, lat, message, user_id, radius = 0.5, reference) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        if (radius && !this.validateRadius(radius)) {
            throw new Error("Rayon invalide");
        }
        if (!message.trim() || message.length > 4096) {
            throw new Error("Message invalide");
        }
        if (reference) {
            const ref = await Defuse.getDefuseByBombId(reference);
            if (ref.rowCount < 1) {
                throw new Error("Référence inexistante");
            }
            if (ref.rows[0].user_id !== user_id) {
                throw new Error("Impossible de répondre à cette bombe");
            }
            if (ref.rows[0].created_at < new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)) { // TODO: check if timestamp or date
                throw new Error("Référence expirée");
            }
            const bomb = await Bomb.getBombById(reference);
            if (bomb.rowCount < 1) {
                throw new Error("Référence inexistante");
            }
            if (bomb.rows[0].reference) {
                const ref1 = await Bomb.getBombById(bomb.rows[0].reference);
                if (ref1.rows[0]?.user_id !== user_id) {
                    throw new Error("Cette bombe est une réponse à une bombe ne vous appartenant pas");
                }
            }
            if (radius !== bomb.rows[0].radius) {
                throw new Error("Rayon incompatible avec la référence");
            }
            if (bomb.rows[0].state === 1) {
                throw new Error("Bombe non désamorcée");
            }
            if (bomb.rows[0].state === 3) {
                throw new Error("Bombe déjà répondue");
            }
            await pool.query("UPDATE bombs SET state = $1 WHERE id = $2", [Bomb.states.REPLIED, reference]);
        }
        const b = await pool.query(`INSERT INTO bombs (state, lon, lat, message, user_id, radius, reference) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [this.states.ACTIVE, lon, lat, message, user_id, radius, reference]);
        await User.decreaseBombs(user_id);
        return b;
    }

    static validateRadius(radius) {
        return radius >= 0.01 && radius <= 5;
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
        const distance = Math.acos(Math.sin(Location.toRadians(lat)) * Math.sin(Location.toRadians(bomb.rows[0].lat)) + Math.cos(Location.toRadians(lat)) * Math.cos(Location.toRadians(bomb.rows[0].lat)) * Math.cos(Location.toRadians(lon) - Location.toRadians(bomb.rows[0].lon))) * 6371;
        if (distance > bomb.rows[0].radius) {
            throw new Error("Distance trop grande");
        }
        await Defuse.createDefuse(bomb_id, user_id, lon, lat);
        return pool.query(`UPDATE bombs SET state = $1 WHERE id = $2 RETURNING *`, [this.states.DEFUSED, bomb_id]);
    }

    static async getBombs(lon, lat, user_id) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        return pool.query(`SELECT bombs.id, bombs.user_id, bombs.lon, bombs.lat, bombs.radius FROM bombs LEFT OUTER JOIN bombs ref ON ref.id = bombs.reference WHERE bombs.state = $1 AND (bombs.reference IS NULL OR ref.user_id = $4) AND ((bombs.lon = $2 AND bombs.lat = $3) OR acos(sin(radians($3)) * sin(radians(bombs.lat)) + cos(radians($3)) * cos(radians(bombs.lat)) * cos(radians(bombs.lon) - radians($2))) * 6371 <= 5)`, [this.states.ACTIVE, lon, lat, user_id]);
    }

    static getUserBombs(user_id) {
        return pool.query(`SELECT bombs.id, bombs.state, bombs.lon, bombs.lat, bombs.message, bombs.user_id, bombs.radius, bombs.reference, bombs.created_at, defuses.created_at AS defused_at, reply.id AS reply_id, reply.state AS reply_state, reply.created_at AS replied_at FROM bombs LEFT OUTER JOIN defuses ON bomb_id = bombs.id LEFT OUTER JOIN bombs reply ON reply.reference = bombs.id WHERE bombs.user_id = $1`, [user_id]);
    }

    static getBombById(id) {
        return pool.query(`SELECT * FROM bombs WHERE id = $1`, [id]);
    }
}

module.exports = Bomb;