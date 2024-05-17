const Bomb = require("./modules/Bomb");
const Defuse = require("./modules/Defuse");
const User = require("./modules/user");

// Create tables & init modules
User.createTable();
Bomb.createTable();
Defuse.createTable();