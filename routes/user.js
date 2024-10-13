const User = require("../modules/User");
const Cookie = require("../modules/Cookie");
const Breakage = require("../modules/Breakage");

// Fonction API pour récupérer un utilisateur
function getUser(req, res) {
    // req.user provient de la fonction "authenticate"
    if (User.getId(req.params.id, req.user.id) !== req.user.id) { // Si la requête demande de récupérer un autre utilisateur que lui-même
        return res.status(401).send({ error: "Non autorisé" });
    }
    res.status(200).send(req.user);
}

// Récupérer la liste des cookies d'un utilisateur
function getUserCookies(req, res) {
    // req.user provient de la fonction "authenticate"
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

// Récupérer la liste des cassages de cookies d'un utilisateur
function getUserBreakages(req, res) {
    // req.user provient de la fonction "authenticate"
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