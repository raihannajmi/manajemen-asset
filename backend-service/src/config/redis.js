const Redis = require('ioredis');
const env = require('./env');

const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis successfully');
});

module.exports = redisConnection;
