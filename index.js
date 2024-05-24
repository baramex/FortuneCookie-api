const Bomb = require("./modules/Bomb");
const Defuse = require("./modules/Defuse");
const User = require("./modules/user");
const express = require('express');
const bodyParser = require("body-parser");
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
}

init();