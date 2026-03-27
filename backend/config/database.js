const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize obyektini sozlash
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false, // Konsolda SQL so'rovlarni ko'rsatmaslik uchun
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

/**
 * Ma'lumotlar bazasiga ulanish va sinxronizatsiya qilish
 */
const connectDB = async () => {
    try {
        // Ulanishni tekshirish
        await sequelize.authenticate();
        console.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandingiz.');

        /**
         * ⚠️ MUHIM: { alter: true } rejimi ma'lumotlarni o'chirmaydi.
         * Agar force: true qolsa, har restartda baza tozalanib ketardi.
         * Endi xavfsiz rejimdamiz.
         */
        await sequelize.sync({ alter: true });
        
        console.log('🚀 Ma\'lumotlar bazasi modellari sinxronlashtirildi.');
    } catch (error) {
        console.error('❌ Bazaga ulanishda xatolik yuz berdi:', error.message);
        // Xatolik bo'lsa dasturni to'xtatish
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };