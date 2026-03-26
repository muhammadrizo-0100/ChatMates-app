const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Message = sequelize.define(
        "Message",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            chat_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sender_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            is_edited: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            // Ixtiyoriy: Tahrirlangan vaqtni saqlash foydali bo'lishi mumkin
            edited_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: "message",
            timestamps: true // Bu updatedAt va createdAt ni o'zi avtomat qo'shadi
        }
    );

    Message.associate = (models) => {
        // onDelete: "CASCADE" qo'shishni maslahat beraman. 
        // Agar chat o'chsa, xabarlar ham avtomat o'chadi.
        Message.belongsTo(models.Chat, { as: "chat", foreignKey: "chat_id", onDelete: "CASCADE" });
        Message.belongsTo(models.User, { as: "sender", foreignKey: "sender_id" });
    };

    return Message;
};