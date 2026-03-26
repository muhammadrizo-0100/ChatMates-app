const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandingiz.');


        await sequelize.sync({ alter: true });
        console.log('🚀 Hamma modellar ma\'lumotlar bazasi bilan sinxronlashtirildi.');
    } catch (error) {
        console.error('❌ Bazaga ulanishda xatolik yuz berdi:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };