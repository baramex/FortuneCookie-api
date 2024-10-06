const User = require("../modules/User");
const Cookie = require("../modules/Cookie");
const Breakage = require("../modules/Breakage");

function getUser(req, res) {
    if (User.getId(req.params.id, req.user.id) !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    res.status(200).send(req.user);
}

function getUserCookies(req, res) {
    const id = User.getId(req.params.id, req.user.id);
    if (id !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    Cookie.getUserCookies(id).then((cookies) => {
        res.status(200).send(cookies.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

function getUserBreakages(req, res) {
    const id = User.getId(req.params.id, req.user.id);
    if (id !== req.user.id) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    Breakage.getUserBreakages(id).then((breakages) => {
        res.status(200).send(breakages.rows);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { getUser, getUserCookies, getUserBreakages };