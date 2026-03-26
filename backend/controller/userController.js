const { User } = require("../models");
const { validateUser } = require("../validations/userValidation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// 1. REGISTER
exports.register = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const userExists = await User.findOne({ where: { username: req.body.username } });
        if (userExists) return res.status(400).json({ message: "Bu username band" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await User.create({ ...req.body, password: hashedPassword });

        // Parolni natijadan o'chirish
        const { password, ...result } = newUser.toJSON();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Parol noto'g'ri" });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || "default_secret_key",
            { expiresIn: "24h" }
        );

        // lastSeen yangilash
        await user.update({ lastSeen: new Date() });

        res.json({
            message: "Muvaffaqiyatli kirdingiz",
            token,
            user: {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                avatar: user.avatar,
                lastSeen: user.lastSeen
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. GET ME
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        // Faqat lastSeen yangilanadi, boshqa atributlarga tegmasdan
        await user.update({ lastSeen: new Date() });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. SEARCH USER
exports.searchUser = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ message: "Username kiritilishi shart" });

        const users = await User.findAll({
            where: {
                username: { [Op.iLike]: `%${username}%` },
                id: { [Op.ne]: req.user.id }
            },
            attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"],
            limit: 15
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. GET ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. GET USER BY ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. UPDATE USER
exports.updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
        return res.status(403).json({ message: "Sizda faqat o'z profilingizni tahrirlash huquqi bor!" });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        // Username o'zgarayotgan bo'lsa bandligini tekshirish
        if (req.body.username && req.body.username !== user.username) {
            const userExists = await User.findOne({ where: { username: req.body.username } });
            if (userExists) return res.status(400).json({ message: "Bu username allaqachon band" });
        }

        // Parol yangilash
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        await user.update(req.body);

        // Parolsiz qaytarish
        const updatedUser = user.toJSON();
        delete updatedUser.password;
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 8. DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        if (req.user.id !== user.id) {
            return res.status(403).json({ message: "Ruxsat etilmagan amal" });
        }

        await user.destroy();
        res.json({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};