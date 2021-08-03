const joi = require('joi');

const userValidation = data =>{
    const schema = joi.object().keys({
        name: joi.string().regex(/^[A-Za-z]+$/).required(),
        password: joi.string().pattern(new RegExp("^[A-Za-z0-9]{3,20}$")).required(),
        email: joi.string().email().lowercase().required(),
        address: joi.string().max(80).required(),
        image: joi.string(),
        role: joi.string().valid('ADMIN','GENERAL').uppercase().required()
    }).unknown();
    return schema.validate(data);
}

module.exports.userValidation = userValidation;