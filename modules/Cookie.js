const pool = require("../services/database");
const Breakage = require("./Breakage");
const Location = require("./Location");
const User = require("./User");

class Cookie {
    static states = {
        ACTIVE: 1,
        BROKEN: 2,
        REPLIED: 3
    };

    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS cookies (
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
                    REFERENCES cookies(id)
        );`);
    }

    static async createCookie(lon, lat, message, user_id, radius = 0.5, reference) {
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
            const ref = await Breakage.getBreakageByCookieId(reference);
            if (ref.rowCount < 1) {
                throw new Error("Référence inexistante");
            }
            if (ref.rows[0].user_id !== user_id) {
                throw new Error("Impossible de répondre à ce cookie");
            }
            if (ref.rows[0].created_at < new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)) { // TODO: check if timestamp or date
                throw new Error("Référence expirée");
            }
            const cookie = await Cookie.getCookieById(reference);
            if (cookie.rowCount < 1) {
                throw new Error("Référence inexistante");
            }
            if (cookie.rows[0].reference) {
                const ref1 = await Cookie.getCookieById(cookie.rows[0].reference);
                if (ref1.rows[0]?.user_id !== user_id) {
                    throw new Error("Ce cookie est une réponse à une cookiee ne vous appartenant pas");
                }
            }
            if (radius !== cookie.rows[0].radius) {
                throw new Error("Rayon incompatible avec la référence");
            }
            if (cookie.rows[0].state === 1) {
                throw new Error("Cookie non cassé");
            }
            if (cookie.rows[0].state === 3) {
                throw new Error("Cookie déjà répondu");
            }
            await pool.query("UPDATE cookies SET state = $1 WHERE id = $2", [Cookie.states.REPLIED, reference]);
        }
        const b = await pool.query(`INSERT INTO cookies (state, lon, lat, message, user_id, radius, reference) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [this.states.ACTIVE, lon, lat, message, user_id, radius, reference]);
        await User.decreaseCookies(user_id);
        return b;
    }

    static validateRadius(radius) {
        return radius >= 0.01 && radius <= 5;
    }

    static async breakCookie(cookie_id, lon, lat, user_id) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        const cookie = await pool.query(`SELECT * FROM cookies WHERE id = $1`, [cookie_id]);
        if (cookie.rowCount < 1) {
            throw new Error("Cookie inexistant");
        }
        if (cookie.rows[0].state === this.states.BROKEN) {
            throw new Error("Cookie déjà cassé");
        }
        if (cookie.rows[0].user_id === user_id) {
            throw new Error("Vous ne pouvez pas casser votre propre cookie");
        }
        const distance = Math.acos(Math.sin(Location.toRadians(lat)) * Math.sin(Location.toRadians(cookie.rows[0].lat)) + Math.cos(Location.toRadians(lat)) * Math.cos(Location.toRadians(cookie.rows[0].lat)) * Math.cos(Location.toRadians(lon) - Location.toRadians(cookie.rows[0].lon))) * 6371;
        if (distance > cookie.rows[0].radius) {
            throw new Error("Distance trop grande");
        }
        await Breakage.createBreakage(cookie_id, user_id, lon, lat);
        return pool.query(`UPDATE cookies SET state = $1 WHERE id = $2 RETURNING *`, [this.states.BROKEN, cookie_id]);
    }

    static async getCookies(lon, lat, user_id) {
        if (!Location.validateLatitude(lat) || !Location.validateLongitude(lon)) {
            throw new Error("Coordonnées invalides");
        }
        return pool.query(`SELECT cookies.id, cookies.user_id, cookies.lon, cookies.lat, cookies.radius FROM cookies LEFT OUTER JOIN cookies ref ON ref.id = cookies.reference WHERE cookies.state = $1 AND (cookies.reference IS NULL OR ref.user_id = $4) AND ((cookies.lon = $2 AND cookies.lat = $3) OR acos(sin(radians($3)) * sin(radians(cookies.lat)) + cos(radians($3)) * cos(radians(cookies.lat)) * cos(radians(cookies.lon) - radians($2))) * 6371 <= 5)`, [this.states.ACTIVE, lon, lat, user_id]);
    }

    static getUserCookies(user_id) {
        return pool.query(`SELECT cookies.id, cookies.state, cookies.lon, cookies.lat, cookies.message, cookies.user_id, cookies.radius, cookies.reference, cookies.created_at, breakages.created_at AS broken_at, reply.id AS reply_id, reply.state AS reply_state, reply.created_at AS replied_at FROM cookies LEFT OUTER JOIN breakages ON cookie_id = cookies.id LEFT OUTER JOIN cookies reply ON reply.reference = cookies.id WHERE cookies.user_id = $1`, [user_id]);
    }

    static getCookieById(id) {
        return pool.query(`SELECT * FROM cookies WHERE id = $1`, [id]);
    }
}

module.exports = Cookie;