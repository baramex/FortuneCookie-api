const { scheduleJob } = require("node-schedule");
const User = require("../modules/User");

// Mise à jour journalière (ajouter les bombes aux utilisateurs)
scheduleJob('0 0 * * *', () => {
    User.incrementBombsEveryone();
});