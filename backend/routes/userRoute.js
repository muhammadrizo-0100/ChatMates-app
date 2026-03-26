const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Foydalanuvchilarni boshqarish, autentifikatsiya va profil amallari
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Yangi foydalanuvchini ro'yxatdan o'tkazish
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: abbos_dev
 *                 description: Noyob foydalanuvchi nomi
 *               password:
 *                 type: string
 *                 example: pass1234
 *                 description: Kamida 6 ta belgidan iborat parol
 *               firstname:
 *                 type: string
 *                 example: Abbos
 *               lastname:
 *                 type: string
 *                 example: Aliyev
 *               email:
 *                 type: string
 *                 example: test@mail.com
 *               tel:
 *                 type: string
 *                 example: "+998901234567"
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli yaratildi
 *       400:
 *         description: Validatsiya xatosi yoki username band
 *       500:
 *         description: Server xatosi
 */
router.post("/user/register", controller.register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Tizimga kirish va JWT Token olish
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: abbos_dev
 *               password:
 *                 type: string
 *                 example: pass1234
 *     responses:
 *       200:
 *         description: Login muvaffaqiyatli, token qaytarildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Parol noto'g'ri
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.post("/user/login", controller.login);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Joriy foydalanuvchi profilini olish
 *     description: Tokendagi ma'lumotlar asosida foydalanuvchining shaxsiy ma'lumotlarini qaytaradi va lastSeen vaqtini yangilaydi.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari
 *       401:
 *         description: Avtorizatsiya xatosi (Token xato)
 */
router.get("/user/me", authMiddleware, controller.getMe);

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     summary: Foydalanuvchilarni username bo'yicha qidirish
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Qidirilayotgan foydalanuvchi nomi (qisman bo'lishi mumkin)
 *     responses:
 *       200:
 *         description: Topilgan foydalanuvchilar ro'yxati
 *       400:
 *         description: Username kiritilmagan
 */
router.get("/user/search", authMiddleware, controller.searchUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Barcha foydalanuvchilar ro'yxatini olish
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchilar massivi qaytarildi
 */
router.get("/user", authMiddleware, controller.getUsers);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: ID orqali bitta foydalanuvchini ko'rish
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari topildi
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.get("/user/:id", authMiddleware, controller.getUserById);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Foydalanuvchi ma'lumotlarini tahrirlash
 *     description: Faqatgina o'z profilingizni o'zgartira olasiz
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               avatar:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ma'lumotlar yangilandi
 *       403:
 *         description: Ruxsat yo'q
 */
router.put("/user/:id", authMiddleware, controller.updateUser);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Hisobni o'chirish
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foydalanuvchi tizimdan o'chirildi
 *       403:
 *         description: Ruxsat etilmagan amal
 */
router.delete("/user/:id", authMiddleware, controller.deleteUser);

module.exports = router;