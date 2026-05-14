const authService = require('./auth.service');
const { logAction } = require('../../shared/utils/auditLogger');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      await logAction({
        actorUserId: result.user.id, module: 'AUTH', action: 'REGISTER',
        entityType: 'User', entityId: result.user.id,
        afterJson: { email: result.user.email, role: result.user.role },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
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
      await logAction({
        actorUserId: result.user.id, module: 'AUTH', action: 'LOGIN',
        entityType: 'User', entityId: result.user.id,
        afterJson: { email: result.user.email },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
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
    if (req.user) {
      await logAction({
        actorUserId: req.user.id, module: 'AUTH', action: 'LOGOUT',
        entityType: 'User', entityId: req.user.id,
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async me(req, res) {
    res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
