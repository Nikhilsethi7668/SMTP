import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { startScheduler } from './services/warmupScheduler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Start the warmup email scheduler with cron
console.log('🚀 Starting Mailing Server Scheduler...');
console.log(`📡 MongoDB URI: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);

// Start the cron scheduler
// Default: runs every 15 minutes to check for active warmup emails
const cronSchedule = process.env.CRON_SCHEDULE || '*/15 * * * *'; // Every 15 minutes
startScheduler(cronSchedule);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: shutting down scheduler');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: shutting down scheduler');
  process.exit(0);
});
