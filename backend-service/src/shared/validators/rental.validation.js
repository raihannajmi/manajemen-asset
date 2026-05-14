const Joi = require('joi');

const createRentalSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  eventName: Joi.string().required().min(3).max(100),
  startDatetime: Joi.date().iso().required(),
  endDatetime: Joi.date().iso().greater(Joi.ref('startDatetime')).required().messages({
    'date.greater': 'Waktu selesai harus lebih besar dari waktu mulai'
  }),
  participantCount: Joi.number().integer().min(1).required(),
  purpose: Joi.string().required().min(10)
});

const updateRentalSchema = Joi.object({
  eventName: Joi.string().min(3).max(100),
  startDatetime: Joi.date().iso(),
  endDatetime: Joi.date().iso().greater(Joi.ref('startDatetime')).messages({
    'date.greater': 'Waktu selesai harus lebih besar dari waktu mulai'
  }),
  participantCount: Joi.number().integer().min(1),
  purpose: Joi.string().min(10)
}).min(1); // At least one field must be provided

const actionNoteSchema = Joi.object({
  note: Joi.string().optional().allow('', null)
});

const approveSchema = Joi.object({
  action: Joi.string().valid('APPROVED', 'REJECTED', 'REVISION').required(),
  note: Joi.alternatives().conditional('action', {
    is: Joi.string().valid('REJECTED', 'REVISION'),
    then: Joi.string().required().messages({
      'any.required': 'Catatan wajib diisi untuk penolakan atau revisi'
    }),
    otherwise: Joi.string().optional().allow('', null)
  })
});

module.exports = {
  createRentalSchema,
  updateRentalSchema,
  actionNoteSchema,
  approveSchema
};
