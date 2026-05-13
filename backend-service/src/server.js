const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const redis = require('./config/redis');

const startServer = async () => {
  try {
    // Check DB Connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL successfully via Prisma');

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
