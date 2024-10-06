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
    // Create tables & init modules
    await User.createTable();
    await Cookie.createTable();
    await Breakage.createTable();

    app.use(bodyParser.json());
    app.listen(3000, () => {
        console.log("[SERVEUR] Démarré sur le port 3000");
    });

    app.post("/register", register);
    app.post("/cookies", authenticate, plantCookie);
    app.post("/cookies/:id/break", authenticate, cookie, breakCookie);
    app.post("/cookies/:id/reply", authenticate, cookie, replyCookie);
    app.get("/cookies", authenticate, getCookies);
    app.get("/users/:id", authenticate, getUser);
    app.get("/users/:id/cookies", authenticate, getUserCookies);
    app.get("/users/:id/breakages", authenticate, getUserBreakages);
}

init();