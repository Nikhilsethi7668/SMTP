import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection configuration
// Use connection URL if provided, otherwise use host/port
const getRedisConnection = () => {
  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        if (times <= 5) {
          console.log(`🔄 Redis reconnection attempt ${times}, waiting ${delay}ms...`);
        }
        return delay;
      },
      maxRetriesPerRequest: null, // Retry indefinitely
      enableReadyCheck: true,
      lazyConnect: false,
      connectTimeout: 10000,
      keepAlive: 30000,
      family: 4, // Force IPv4
    };
  }
  
  return {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      if (times <= 5) {
        console.log(`🔄 Redis reconnection attempt ${times}, waiting ${delay}ms...`);
      }
      return delay;
    },
    maxRetriesPerRequest: null, // Retry indefinitely
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10000,
    keepAlive: 30000,
    family: 4, // Force IPv4
  };
};

const connection = getRedisConnection();
const connectionInfo = process.env.REDIS_URL || `${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;
console.log(`📡 Connecting to Redis at ${connectionInfo}`);

// Create email queue
export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  },
});

// Queue event listeners
let connectionErrorCount = 0;
emailQueue.on('error', (error) => {
  connectionErrorCount++;
  // Only log first few errors to avoid spam
  if (connectionErrorCount <= 3) {
    console.error('❌ Email Queue Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('   Redis connection refused. Make sure Redis container is running.');
      console.error(`   Connection: ${connectionInfo}`);
    }
  }
});

emailQueue.on('ready', () => {
  if (connectionErrorCount > 0) {
    console.log('✅ Email Queue reconnected to Redis successfully');
    connectionErrorCount = 0; // Reset error count on successful connection
  } else {
    console.log('✅ Email Queue connected to Redis successfully');
  }
});

emailQueue.on('waiting', (job) => {
  console.log(`Job ${job.id} is waiting`);
});

emailQueue.on('active', (job) => {
  console.log(`Job ${job.id} is now active`);
});

emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} has completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed:`, err.message);
});

export default emailQueue;

