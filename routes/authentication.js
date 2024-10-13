const User = require("../modules/User");

// Fonction API pour se créer un compte
function register(req, res) {
    if (!req.body || typeof req.body.username !== "string") {
        return res.status(400).send({ error: "Requête invalide" });
    }
    User.createUser(req.body.username).then((user) => {
        res.status(201).send(user.rows[0]); // 201: contenu créé
    }).catch((error) => {
        res.status(400).send({ error: error?.message || "Erreur inattendue" });
    });
}

// Fonction API intergicielle pour authentifier une requête grâce à son token (clé)
async function authenticate(req, res, next) {
    if (!req.headers.authorization || !req.headers.authorization?.startsWith("Bearer ")) {
        return res.status(403).send({ error: "Non authentifié" });  // Si la requête ne contient pas l'en-tête d'authentification
    }
    const user = await User.getUserByToken(req.headers.authorization?.split(" ")?.[1]); // Récupérer l'utilisateur avec la clé
    if (user.rowCount < 1) { // Si l'utilisateur n'existe pas
        return res.status(401).send({ error: "Non autorisé" });
    }
    req.user = user.rows[0];
    next(); // Passer à la fonction suivante
}

module.exports = { register, authenticate };