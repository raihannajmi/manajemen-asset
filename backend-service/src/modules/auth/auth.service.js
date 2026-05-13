const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const env = require('../../config/env');

class AuthService {
  async register(userData) {
    const { email, password, fullName, phone, organization, roleCode } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Get role
    const role = await prisma.role.findUnique({ where: { code: roleCode || 'PENYEWA' } });
    if (!role) {
      throw new Error('Invalid role');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        phone,
        organization,
        passwordHash,
        roleId: role.id,
      },
      include: { role: true },
    });

    return this.generateTokens(user);
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    return this.generateTokens(user);
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role.code },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.code,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}

module.exports = new AuthService();
