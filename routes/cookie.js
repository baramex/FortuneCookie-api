const Cookie = require("../modules/Cookie");
const Breakage = require("../modules/Breakage");

// Fonction API pour poser un cookie
// Données nécessaires: lon, lat, message
// Données optionnelles: rayon
function plantCookie(req, res) {
    if (!req.body || typeof req.body.lon !== "number" || typeof req.body.lat !== "number" || typeof req.body.message !== "string" || (req.body.radius && typeof req.body.radius !== "number") || !req.body.message.trim()) { // Vérifier le type des données transmises dans la requête
        return res.status(400).send({ error: "Requête invalide" });
    }
    // req.user provient de la fonction "authenticate"
    if (req.user.remaining_cookies < 1) { // Les cookies disponibles de l'utilisateur
        return res.status(403).send({ error: "Pas assez de cookies" });
    }
    Cookie.createCookie(req.body.lon, req.body.lat, req.body.message, req.user.id, req.body.radius).then((cookie) => {
        res.status(201).send(cookie.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

// Fonction API pour répondre à un cookie
// Données nécessaires: message, cookie
async function replyCookie(req, res) {
    // req.cookie provient de la fonction "cookie"
    if (!req.body || !req.cookie || typeof req.body.message !== "string") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    const breakage = await Breakage.getBreakageByCookieId(req.cookie.id);
    if (!breakage.rows[0]) {
        return res.status(400).send({ error: "Cookie non cassé" });
    }
    // req.user provient de la fonction "authenticate"
    Cookie.createCookie(breakage.rows[0].lon, breakage.rows[0].lat, req.body.message, req.user.id, req.cookie.radius, req.cookie.id).then((cookie) => {
        res.status(201).send(cookie.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });

}

// Fonction API pour casser un cookie
// Données nécessaires: lon, lat, cookie
function breakCookie(req, res) {
    // req.cookie provient de la fonction "cookie"
    if (!req.body || !req.cookie || typeof req.body.lon !== "number" || typeof req.body.lat !== "number") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    // req.user provient de la fonction "authenticate"
    Cookie.breakCookie(req.cookie.id, req.body.lon, req.body.lat, req.user.id).then((broken) => {
        res.status(201).send({ cookieId: req.cookie.id, message: broken.rows[0].message, reference: broken.rows[0].reference });
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

// Fonction API pour récupérer les cookies à proximité
// Données nécessaires: lon, lat
function getCookies(req, res) {
    // req.cookie provient de la fonction "cookie"
    if (!req.query || isNaN(Number(req.query.lon)) || isNaN(Number(req.query.lat))) {
        return res.status(400).send({ error: "Requête invalide" });
    }
    // req.user provient de la fonction "authenticate"
    Cookie.getCookies(Number(req.query.lon), Number(req.query.lat), req.user.id).then((cookies) => {
        res.status(200).send(cookies.rows.filter(a => a.user_id !== req.user.id).map(a => ({ id: a.id, lon: a.lon, lat: a.lat, radius: a.radius })));
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

// Fonction API intergicielle pour récupérer le cookie spécifié dans les paramètres de la requête
function cookie(req, res, next) {
    const id = Number(req.params.id); // ID du cookie au travers des paramètres
    if (isNaN(id)) { // NotaNumber
        return res.status(400).send({ error: "Requête invalide" });
    }
    Cookie.getCookieById(id).then((cookie) => {
        if (cookie.rowCount < 1) {
            return res.status(404).send({ error: "Cookie introuvable" });
        }
        req.cookie = cookie.rows[0];
        next();
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

module.exports = { plantCookie, breakCookie, getCookies, cookie, replyCookie };