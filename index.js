require("dotenv").config();
const User = require("./modules/User");
const express = require('express');
const bodyParser = require("body-parser");
const { register, authenticate } = require("./routes/authentication");
const { plantCookie, cookie, breakCookie, replyCookie, getCookies } = require("./routes/cookie");
const { getUser, getUserCookies, getUserBreakages } = require("./routes/user");
const Cookie = require("./modules/Cookie");
const Breakage = require("./modules/Breakage");
const app = express();

async function init() {
    // Créer les tables
    await User.createTable();
    await Cookie.createTable();
    await Breakage.createTable();

    // Mettre en marche le serveur web
    app.use(bodyParser.json());
    app.listen(3000, () => {
        console.log("[SERVEUR] Démarré sur le port 3000");
    });

    app.post("/register", register); // Créer un utilisateur
    app.post("/cookies", authenticate, plantCookie); // Placer un cookie
    app.post("/cookies/:id/break", authenticate, cookie, breakCookie); // Casser un cookie
    app.post("/cookies/:id/reply", authenticate, cookie, replyCookie); // Répondre à un cookie
    app.get("/cookies", authenticate, getCookies); // Récupérer les cookies à proximité
    app.get("/users/:id", authenticate, getUser); // Récupérer un utilisateur par son ID
    app.get("/users/:id/cookies", authenticate, getUserCookies); // Récupérer les cookies d'un utilisateur
    app.get("/users/:id/breakages", authenticate, getUserBreakages); // Récupérer les cassages de cookies d'un utilisateur
}

init();