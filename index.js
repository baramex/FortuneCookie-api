const Bomb = require("./modules/Bomb");
const Defuse = require("./modules/Defuse");
const User = require("./modules/user");
const express = require('express');
const bodyParser = require("body-parser");
const { register, authenticate } = require("./routes/authentication");
const app = express();

async function init() {
    // Create tables & init modules
    await User.createTable();
    await Bomb.createTable();
    await Defuse.createTable();

    app.use(bodyParser.json());
    app.listen(3000, () => {
        console.log("[SERVEUR] Démarré sur le port 3000");
    });

    app.post("/register", register);
    app.post("/bombs", authenticate, plantBomb);
    app.post("/bombs/:id/defuse", authenticate, defuseBomb);
    app.get("/bombs", authenticate, getBombs);
    app.get("/users/:id", authenticate, getUser);
    app.get("/users/:id/bombs", authenticate, getUserBombs);
}

init();