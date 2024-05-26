const Bomb = require("../modules/Bomb");

function plantBomb(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.body || typeof req.body.lon !== "number" || typeof req.body.lat !== "number" || typeof req.body.message !== "string") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    if (req.user.remaining_bombs < 1) {
        return res.status(403).send({ error: "Pas assez de bombes" });
    }
    Bomb.createBomb(req.body.lon, req.body.lat, req.body.message, req.user.id).then((bomb) => {
        res.status(201).send(bomb.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function defuseBomb(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.body || isNaN(Number(req.params.id)) || typeof req.body.lon !== "number" || typeof req.body.lat !== "number") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    Bomb.defuseBomb(Number(req.params.id), req.body.lon, req.body.lat, req.user.id).then((defused) => {
        res.status(201).send({ message: defused.rows[0].message });
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function getBombs(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.query || typeof req.query.lon !== "number" || typeof req.query.lat !== "number") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    Bomb.getBombs(req.query.lon, req.query.lat).then((bombs) => {
        res.status(200).send(bombs.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { plantBomb, defuseBomb, getBombs };