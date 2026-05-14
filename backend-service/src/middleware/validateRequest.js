const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow fields not defined in schema (can be changed per schema)
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        message: 'Validasi Gagal',
        errors: details
      });
    }

    // Replace req body/query/params with validated & stripped data
    req[property] = value;
    next();
  };
};

module.exports = validateRequest;
