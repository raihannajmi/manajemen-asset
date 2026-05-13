const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/db');

const verifyToken = async (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided!' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    req.userId = decoded.id;
    // Fetch user and role to attach to request
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }

    if (!user.isActive) {
       return res.status(403).json({ message: 'Account is deactivated!' });
    }

    req.user = user;
    req.roleCode = user.role.code;
    next();
  });
};

module.exports = { verifyToken };
