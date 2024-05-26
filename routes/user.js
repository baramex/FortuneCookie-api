const Bomb = require("../modules/Bomb");
const User = require("../modules/user");

function getUser(req, res) {
    if (!req.user || User.getId(req.params.id, req.user.id) !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    res.status(200).send(req.user);
}

function getUserBombs(req, res) {
    if (!req.user || User.getId(req.params.id, req.user.id) !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    Bomb.getUserBombs(req.params.id).then((bombs) => {
        res.status(200).send(bombs.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { getUser, getUserBombs };