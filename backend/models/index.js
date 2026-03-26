const Sequelize = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./User.js")(sequelize, Sequelize);
const Chat = require("./Chat.js")(sequelize, Sequelize);
const Message = require("./Message.js")(sequelize, Sequelize); // Yangi qo'shildi

// Associate qilish
User.associate(sequelize.models);
Chat.associate(sequelize.models);
Message.associate(sequelize.models); // Yangi qo'shildi

module.exports = { User, Chat, Message, sequelize };