const { Queue } = require('bullmq');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const pdfQueue = new Queue('pdf-generation', { connection: redisConfig });

async function retryFailed() {
  try {
    const failedJobs = await pdfQueue.getFailed();
    console.log(`Found ${failedJobs.length} failed jobs.`);
    
    for (const job of failedJobs) {
      console.log(`Retrying job ${job.id}...`);
      await job.retry();
    }
    
    console.log('Done retrying. They should process in the background now.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

retryFailed();
