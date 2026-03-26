const Joi = require("joi");

// 1. Ro'yxatdan o'tish va tahrirlash uchun (Asosiy)
exports.validateUser = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        password: Joi.string().min(6).required(),
        firstname: Joi.string().min(2).allow(null, ''),
        lastname: Joi.string().min(2).allow(null, ''),
        email: Joi.string().email().allow(null, ''),
        tel: Joi.string().min(7).allow(null, ''),
        avatar: Joi.string().allow(null, ''),
    });

    return schema.validate(data);
};

// 2. Login uchun (Faqat username va password)
exports.validateLogin = (data) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
};

// 3. Qidiruv (Search) uchun 
exports.validateSearch = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(1).required(), // Kamida 1 ta harf yozish kerak qidirish uchun
    });

    return schema.validate(data);
};