const { DataTypes } = require("sequelize");



module.exports = (sequelize) => {

    const User = sequelize.define(

        "User",

        {

            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

            username: { type: DataTypes.STRING, allowNull: false, unique: true },

            password: { type: DataTypes.STRING, allowNull: false },

            firstname: { type: DataTypes.STRING, allowNull: true },

            lastname: { type: DataTypes.STRING, allowNull: true },

            email: { type: DataTypes.STRING, allowNull: true },

            tel: { type: DataTypes.STRING, allowNull: true },

            avatar: { type: DataTypes.STRING, allowNull: true, defaultValue: "default.png" },

            // Oxirgi marta qachon ko'ringanligini saqlash uchun ustun

            lastSeen: {

                type: DataTypes.DATE,

                allowNull: true,

                defaultValue: DataTypes.NOW

            },

        },

        { tableName: "user", timestamps: true }

    );



    User.associate = (models) => {

        // User qatnashgan chatlar (user1 va user2 sifatida)

        User.hasMany(models.Chat, { as: "chatsAsUser1", foreignKey: "user1_id" });

        User.hasMany(models.Chat, { as: "chatsAsUser2", foreignKey: "user2_id" });



        // User yozgan barcha xabarlar

        User.hasMany(models.Message, { as: "messages", foreignKey: "sender_id" });

    };



    return User;

};