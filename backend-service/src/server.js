const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const redis = require('./config/redis');
const { startRentalJobs } = require('./jobs/rental.jobs');

const startServer = async () => {
  try {
    // Check DB Connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL successfully via Prisma');

    // Start background jobs
    startRentalJobs();
    require('./workers/pdfWorker'); // Initialize BullMQ Worker for PDF Generation

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
