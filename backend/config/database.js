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

        // ⚠️ DIQQAT: force: true bazani drop qilib, noldan ochadi. 
        // Hamma eski ma'lumotlar o'chib ketadi!
        await sequelize.sync({ force: true }); 
        
        console.log('🚀 Baza TOZALANDI va modellar qayta yaratildi.');
    } catch (error) {
        console.error('❌ Bazaga ulanishda xatolik yuz berdi:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };