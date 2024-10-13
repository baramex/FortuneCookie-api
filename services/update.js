const { scheduleJob } = require("node-schedule");
const User = require("../modules/User");

// Mise à jour journalière (ajouter les cookies disponibles aux utilisateurs)
scheduleJob('0 0 * * *', () => {
    User.incrementCookieCountForEveryone();
});