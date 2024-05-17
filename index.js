const Bomb = require("./modules/Bomb");
const Defuse = require("./modules/Defuse");
const User = require("./modules/user");

async function init() {
    // Create tables & init modules
    await User.createTable();
    await Bomb.createTable();
    await Defuse.createTable();
}

init();