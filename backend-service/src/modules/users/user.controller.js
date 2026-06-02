const userService = require('./user.service');
const { logAction } = require('../../shared/utils/auditLogger');

class UserController {
  async getUsers(req, res) {
    try {
      const data = await userService.getUsers(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const data = await userService.getUserById(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const originalUser = await userService.getUserById(req.params.id);
      const data = await userService.updateUser(req.params.id, req.body);
      
      await logAction({
        actorUserId: req.user.id,
        module: 'USER_MGMT',
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: data.id,
        beforeJson: originalUser,
        afterJson: data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const data = await userService.deleteUser(req.params.id);
      
      await logAction({
        actorUserId: req.user.id,
        module: 'USER_MGMT',
        action: 'USER_DEACTIVATED',
        entityType: 'User',
        entityId: data.id,
        afterJson: { isActive: false },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ message: `User ${data.fullName} has been successfully deactivated.`, data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getRoles(req, res) {
    try {
      const data = await userService.getRoles();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
