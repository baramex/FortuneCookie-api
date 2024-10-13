const pool = require("../services/database");
const tokgen = new (require("uuid-token-generator"))(512);

// En relation avec les utilisateurs
class User {
    // Créer la table si elle n'existe pas déjà
    static createTable() {
        return pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(32) UNIQUE NOT NULL,
            remaining_cookies SMALLINT DEFAULT 3,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    }

    static getId(id, user_id) {
        return id === "@me" ? user_id : Number(id); // L'ID lors des requêtes API: @me: renvoyer l'ID de l'utilisateur actuel, sinon transformer l'ID en nombre
    }

    static validateUsername(username) {
        return /[0-9A-z_]{3,32}/.test(username); // Un nom d'utilisateur ne doit contenir que des chiffres, lettres, ou _ et doit faire entre 3 et 32 caractères (RegEx)
    }

    // Récupérer un utilisateur par son token (clé)
    static getUserByToken(token) {
        return pool.query(`SELECT * FROM users WHERE token = $1`, [token]);
    }

    // Créer un utilisateur dans la base de donnée
    static async createUser(username) {
        if (!this.validateUsername(username)) {
            throw new Error("Nom d'utilisateur invalide");
        }
        const token = tokgen.generate(); // Générer un token (clé)
        return pool.query(`INSERT INTO users (token, username) VALUES ($1, $2) RETURNING *`, [token, username]);
    }

    // Retirer un cookie disponible à un utilisateur
    static decreaseCookieCount(user_id) {
        return pool.query(`UPDATE users SET remaining_cookies = remaining_cookies - 1 WHERE id = $1 RETURNING *`, [user_id]);
    }

    // Ajouter un cookie disponible (max 3) à chaque utilisateur
    static incrementCookieCountForEveryone() {
        return pool.query("UPDATE users SET remaining_cookies = remaining_cookies + 1 WHERE remaining_cookies < 3");
    }
}

module.exports = User;