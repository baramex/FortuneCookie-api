const Bomb = require("../modules/Bomb");
const Defuse = require("../modules/Defuse");

function plantBomb(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.body || typeof req.body.lon !== "number" || typeof req.body.lat !== "number" || typeof req.body.message !== "string" || (req.body.radius && typeof req.body.radius !== "number") || !req.body.message.trim()) {
        return res.status(400).send({ error: "Requête invalide" });
    }
    if (req.user.remaining_bombs < 1) {
        return res.status(403).send({ error: "Pas assez de bombes" });
    }
    Bomb.createBomb(req.body.lon, req.body.lat, req.body.message, req.user.id, req.body.radius).then((bomb) => {
        res.status(201).send(bomb.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

async function replyBomb(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.body || !req.bomb || typeof req.body.message !== "string") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    const defuse = await Defuse.getDefuseByBombId(req.bomb.id);
    if (!defuse.rowCount) {
        throw new Error("Bombe non désamorcée");
    }
    Bomb.createBomb(defuse.rows[0].lon, defuse.rows[0].lat, req.body.message, req.user.id, req.bomb.radius, req.bomb.id).then((bomb) => {
        res.status(201).send(bomb.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });

}

function defuseBomb(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.body || !req.bomb || typeof req.body.lon !== "number" || typeof req.body.lat !== "number") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    Bomb.defuseBomb(req.bomb.id, req.body.lon, req.body.lat, req.user.id).then((defused) => {
        res.status(201).send({ message: defused.rows[0].message });
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function getBombs(req, res) {
    if (!req.user) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    if (!req.query || isNaN(Number(req.query.lon)) || isNaN(Number(req.query.lat))) {
        return res.status(400).send({ error: "Requête invalide" });
    }
    Bomb.getBombs(Number(req.query.lon), Number(req.query.lat)).then((bombs) => {
        res.status(200).send(bombs.rows.sort(a => a.user_id !== req.user.id).map(a => ({ id: a.id, lon: a.lon, lat: a.lat, radius: a.radius })));
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function bomb(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).send({ error: "Requête invalide" });
    }
    Bomb.getBombById(id).then((bomb) => {
        if (bomb.rowCount < 1) {
            return res.status(404).send({ error: "Bombe introuvable" });
        }
        req.bomb = bomb.rows[0];
        next();
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { plantBomb, defuseBomb, getBombs, bomb, replyBomb };