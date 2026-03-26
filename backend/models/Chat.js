const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Chat = sequelize.define(
        "Chat",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            last_message: { type: DataTypes.TEXT, allowNull: true },
            last_message_time: { type: DataTypes.DATE, allowNull: true },
            user1_id: { type: DataTypes.INTEGER, allowNull: false },
            user2_id: { type: DataTypes.INTEGER, allowNull: false },
        },
        { tableName: "chat", timestamps: true }
    );

    Chat.associate = (models) => {
        // Chat ishtirokchilari
        Chat.belongsTo(models.User, { as: "user1", foreignKey: "user1_id" });
        Chat.belongsTo(models.User, { as: "user2", foreignKey: "user2_id" });

        // Chat ichidagi xabarlar
        Chat.hasMany(models.Message, { as: "messages", foreignKey: "chat_id", onDelete: "CASCADE" });
    };

    return Chat;
}