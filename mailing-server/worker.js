import { connectDB } from './config/db.js';

// Connect to MongoDB before starting workers
(async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');
    
    console.log('🔄 Starting email worker...');
    await import('./workers/emailWorker.js');
    
    console.log('🚀 BullMQ Workers started successfully');
    console.log('📧 Email worker is running and ready to process jobs');
    console.log('ℹ️ Make sure the scheduler is running to create email jobs');
  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();

