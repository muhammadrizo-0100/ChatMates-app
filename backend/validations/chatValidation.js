const Joi = require("joi");

exports.validateChat = (data) => {
    const schema = Joi.object({
        receiverId: Joi.number().integer().required(),
    });

    return schema.validate(data);
};