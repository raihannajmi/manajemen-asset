const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  phone: Joi.string().optional().allow('', null).pattern(/^[0-9+]+$/).messages({
    'string.pattern.base': 'Nomor telepon hanya boleh berisi angka dan tanda +'
  }),
  organization: Joi.string().optional().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};
