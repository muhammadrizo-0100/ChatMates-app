const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false
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