import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { EmailWarmup } from '../models/WarmupEmailModel.js';
import { sendEmail } from '../services/emailService.js';

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
console.log(`📡 Worker connecting to Redis at ${connectionInfo}`);

/**
 * Generate a random delay in milliseconds
 * @param {number} minSeconds - Minimum delay in seconds
 * @param {number} maxSeconds - Maximum delay in seconds
 * @returns {number} Random delay in milliseconds
 */
const getRandomDelay = (minSeconds, maxSeconds) => {
  const min = minSeconds || parseInt(process.env.EMAIL_DELAY_MIN_SECONDS) || 5;
  const max = maxSeconds || parseInt(process.env.EMAIL_DELAY_MAX_SECONDS) || 30;
  const delaySeconds = Math.floor(Math.random() * (max - min + 1)) + min;
  return delaySeconds * 1000; // Convert to milliseconds
};

/**
 * Wait for a random delay
 * @param {number} minSeconds - Minimum delay in seconds
 * @param {number} maxSeconds - Maximum delay in seconds
 */
const waitRandomDelay = async (minSeconds, maxSeconds) => {
  const delayMs = getRandomDelay(minSeconds, maxSeconds);
  const delaySeconds = delayMs / 1000;
  console.log(`⏳ Waiting ${delaySeconds.toFixed(1)} seconds before sending email...`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

// Email worker processor
const emailProcessor = async (job) => {
  const { warmupEmailId, to, subject, body, from } = job.data;
  
  console.log(`Processing email job ${job.id}:`, {
    warmupEmailId,
    to,
    subject,
    from: from,
  });

  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, attempting to connect...');
      const mongoURI = process.env.MONGO_URI;
      if (mongoURI) {
        await mongoose.connect(mongoURI);
      } else {
        throw new Error('MONGO_URI is not defined');
      }
    }

    // If warmupEmailId is provided, fetch from database
    let warmupEmail = null;
    if (warmupEmailId) {
      warmupEmail = await EmailWarmup.findById(warmupEmailId);
      
      if (!warmupEmail) {
        throw new Error(`WarmupEmail with id ${warmupEmailId} not found`);
      }

      // Check if warmup is active
      if (warmupEmail.status !== 'active') {
        throw new Error(`WarmupEmail status is ${warmupEmail.status}, not active`);
      }

      if (!from || !to || !body) {
        throw new Error('Email from, to, and body are required');
      }
      // Use email from model if not provided in job data
      const emailFrom = from || warmupEmail.email;
      const emailTo = to; // You may want to get this from a recipient list
      const emailSubject = subject || 'Warmup Email';
      const emailBody = body || 'This is a warmup email';

      // Add random delay before sending email
      await waitRandomDelay();

      // Send email using nodemailer
      const result = await sendEmail({
        from: emailFrom,
        to: emailTo,
        subject: emailSubject,
        text: emailBody,
      });

      // Update warmup email stats
      warmupEmail.stats.emailsSent += 1;
      warmupEmail.stats.lastActivity = new Date();
      await warmupEmail.save();

      console.log(`✅ Email sent successfully to ${emailTo} for warmup ${warmupEmailId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        warmupEmailId: warmupEmail._id.toString(),
        sentAt: result.sentAt,
      };
    } else {
      // Direct email sending without warmup model
      if (!to) {
        throw new Error('Recipient email (to) is required');
      }

      // Add random delay before sending email
      await waitRandomDelay();

      const result = await sendEmail({
        from: from || 'admin@zeusbull.com',
        to,
        subject: subject || 'Test Email',
        text: body || 'This is a test email',
      });

      console.log(`✅ Email sent successfully to ${to}`);
      
      return {
        success: true,
        messageId: result.messageId,
        sentAt: result.sentAt,
      };
    }
  } catch (error) {
    console.error(`❌ Error processing email job ${job.id}:`, error.message);
    
    // Update warmup email stats on failure if warmupEmailId exists
    if (warmupEmailId) {
      try {
        const warmupEmail = await EmailWarmup.findById(warmupEmailId);
        if (warmupEmail) {
          warmupEmail.stats.lastActivity = new Date();
          await warmupEmail.save();
        }
      } catch (updateError) {
        console.error('Error updating warmup email stats:', updateError);
      }
    }
    
    throw error;
  }
};

// Create email worker
export const emailWorker = new Worker('email', emailProcessor, {
  connection,
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // Per 1 second
  },
});

console.log('✅ Email worker created and listening for jobs on queue: email');
console.log(`   Redis: ${connectionInfo}`);
console.log(`   Concurrency: 5 jobs`);

// Worker event listeners
emailWorker.on('waiting', (job) => {
  console.log(`⏳ Job ${job.id} is waiting (will process in ${Math.round((job.opts.delay || 0) / 60000)} minutes)`);
});

emailWorker.on('active', (job) => {
  console.log(`🔄 Job ${job.id} is now active - processing email to ${job.data.to}`);
});

emailWorker.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id} completed successfully`);
  console.log(`   Sent to: ${job.data.to}`);
  console.log(`   Message ID: ${result?.messageId || 'N/A'}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
  console.error(`   Recipient: ${job.data.to}`);
  console.error(`   Error details:`, err);
});

emailWorker.on('error', (err) => {
  console.error('❌ Email Worker Error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('   Redis connection refused. Make sure Redis container is running.');
    console.error(`   Attempted to connect to: ${connection.host}:${connection.port}`);
    console.error('   Check: docker-compose ps (Redis should be running)');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing email worker...');
  await emailWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Closing email worker...');
  await emailWorker.close();
  process.exit(0);
});

export default emailWorker;

