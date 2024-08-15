const Bomb = require("../modules/Bomb");
const Defuse = require("../modules/Defuse");
const User = require("../modules/User");

function getUser(req, res) {
    if (User.getId(req.params.id, req.user.id) !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    res.status(200).send(req.user);
}

function getUserBombs(req, res) {
    const id = User.getId(req.params.id, req.user.id);
    if (id !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    Bomb.getUserBombs(id).then((bombs) => {
        res.status(200).send(bombs.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function getUserDefuses(req, res) {
    const id = User.getId(req.params.id, req.user.id);
    if (id !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    Defuse.getUserDefuses(id).then((defuses) => {
        res.status(200).send(defuses.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { getUser, getUserBombs, getUserDefuses };