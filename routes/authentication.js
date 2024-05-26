const User = require("../modules/user");

function register(req, res) {
    if (!req.body || typeof req.body.username !== "string") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    User.createUser(req.body.username).then((user) => {
        res.status(201).send(user.rows[0]);
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

async function authenticate(req, res, next) {
    if (!req.headers.authorization || !req.headers.authorization?.startsWith("Bearer ")) {
        return res.status(403).send({ error: "Non authentifié" });
    }
    const user = await User.getUserByToken(req.headers.authorization?.split(" ")?.[1]);
    if (user.rowCount < 1) {
        return res.status(401).send({ error: "Non autorisé" });
    }
    req.user = user.rows[0];
    next();
}

module.exports = { register, authenticate };