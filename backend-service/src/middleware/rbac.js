const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.roleCode) {
      return res.status(403).json({ message: 'Require Role!' });
    }

    if (roles.includes(req.roleCode)) {
      next();
      return;
    }

    res.status(403).json({ message: 'Require Role: ' + roles.join(' or ') });
  };
};

module.exports = { checkRole };
