const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1. Headerdan tokenni olish (odatda "Bearer <token>" ko'rinishida bo'ladi)
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Kirish rad etildi. Token topilmadi!" });
    }

    // "Bearer " qismini olib tashlab, faqat tokenni ajratib olamiz
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token formati noto'g'ri!" });
    }

    try {
        // 2. Tokenni tekshirish
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Foydalanuvchi ma'lumotlarini req obyektiga qo'shish
        // Bu bizga Controller ichida req.user.id ni ishlatish imkonini beradi
        req.user = verified;

        next(); // Hammasi joyida bo'lsa, keyingi funksiyaga o'tish
    } catch (err) {
        res.status(400).json({ message: "Yaroqsiz token!" });
    }
};