const Joi = require("joi");

// XABAR YUBORISHNI TEKSHIRISH
exports.validateMessage = (data) => {
    const schema = Joi.object({
        chat_id: Joi.number()
            .integer()
            .required()
            .messages({
                "number.base": "Chat ID raqam bo'lishi kerak",
                "any.required": "Chat ID (chat_id) kiritilishi shart",
            }),
        text: Joi.string()
            .trim()
            .min(1)
            .required()
            .messages({
                "string.base": "Xabar matn bo'lishi kerak",
                "string.empty": "Bo'sh xabar yuborib bo'lmaydi",
                "string.min": "Xabar kamida 1 ta belgidan iborat bo'lishi kerak",
                "any.required": "Xabar matni (text) kiritilishi shart",
            }),
    });

    return schema.validate(data);
};