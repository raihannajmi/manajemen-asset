const authService = require('./auth.service');
const prisma = require('../../config/db');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      // Log Audit
      await prisma.auditLog.create({
        data: {
          actorUserId: result.user.id,
          module: 'AUTH',
          action: 'REGISTER',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Log Audit
      await prisma.auditLog.create({
        data: {
          actorUserId: result.user.id,
          module: 'AUTH',
          action: 'LOGIN',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req, res) {
    // In a simple JWT setup, logout is often handled by client-side token deletion.
    // For audit purposes:
    if (req.user) {
        await prisma.auditLog.create({
            data: {
              actorUserId: req.user.id,
              module: 'AUTH',
              action: 'LOGOUT',
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
            },
          });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async me(req, res) {
    res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
