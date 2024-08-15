require("dotenv").config();
const Bomb = require("./modules/Bomb");
const Defuse = require("./modules/Defuse");
const User = require("./modules/User");
const express = require('express');
const bodyParser = require("body-parser");
const { register, authenticate } = require("./routes/authentication");
const { plantBomb, defuseBomb, getBombs, bomb, replyBomb } = require("./routes/bomb");
const { getUser, getUserBombs, getUserDefuses } = require("./routes/user");
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
    app.post("/bombs/:id/defuse", authenticate, bomb, defuseBomb);
    app.post("/bombs/:id/reply", authenticate, bomb, replyBomb);
    app.get("/bombs", authenticate, getBombs);
    app.get("/users/:id", authenticate, getUser);
    app.get("/users/:id/bombs", authenticate, getUserBombs);
    app.get("/users/:id/defuses", authenticate, getUserDefuses);
}

init();