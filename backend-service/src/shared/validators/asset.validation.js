const Joi = require('joi');

const createAssetSchema = Joi.object({
  assetCode: Joi.string().required().min(3).max(20),
  categoryId: Joi.number().integer().required(),
  name: Joi.string().required().min(3).max(100),
  location: Joi.string().required().min(3).max(200),
  capacity: Joi.number().integer().min(1).required(),
  description: Joi.string().optional().allow('', null),
  availabilityStatus: Joi.string().valid('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE').optional(),
  facilitiesJson: Joi.array().items(Joi.string()).optional(),
  pricingSchemeJson: Joi.object({
    unit: Joi.string().valid('hour', 'day', 'week', 'month', 'year').required(),
    base_price: Joi.number().min(0).required(),
    tiers: Joi.array().items(Joi.object({
      min_units: Joi.number().min(1).required(),
      max_units: Joi.number().allow(null).optional(),
      price_per_unit: Joi.number().min(0).required()
    })).optional(),
    deposit: Joi.number().min(0).optional(),
    tax_percent: Joi.number().min(0).max(100).optional()
  }).optional()
});

const updateAssetSchema = Joi.object({
  assetCode: Joi.string().min(3).max(20),
  categoryId: Joi.number().integer(),
  name: Joi.string().min(3).max(100),
  location: Joi.string().min(3).max(200),
  capacity: Joi.number().integer().min(1),
  description: Joi.string().optional().allow('', null),
  availabilityStatus: Joi.string().valid('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE'),
  facilitiesJson: Joi.array().items(Joi.string()).optional(),
  pricingSchemeJson: Joi.object({
    unit: Joi.string().valid('hour', 'day', 'week', 'month', 'year').required(),
    base_price: Joi.number().min(0).required(),
    tiers: Joi.array().items(Joi.object({
      min_units: Joi.number().min(1).required(),
      max_units: Joi.number().allow(null).optional(),
      price_per_unit: Joi.number().min(0).required()
    })).optional(),
    deposit: Joi.number().min(0).optional(),
    tax_percent: Joi.number().min(0).max(100).optional()
  }).optional()
}).min(1);

module.exports = {
  createAssetSchema,
  updateAssetSchema
};
