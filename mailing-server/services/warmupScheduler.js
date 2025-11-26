import { emailQueue } from '../queues/emailQueue.js';
import { EmailWarmup } from '../models/WarmupEmailModel.js';
import mongoose from 'mongoose';
import cron from 'node-cron';

const getRecipientList = () => {
  // TODO: Implement recipient list logic
  // This could come from a database, API, or configuration
  // For now, returning a placeholder
  return ['itsadarsh33@gmail.com', 'pofihes346@izeao.com','vivekpatel1374@gmail.com'];
};

/**
 * Generate email content for warmup
 */
const generateWarmupEmailContent = (index) => {
  const subjects = [
    'Quick question',
    'Following up',
    'Checking in',
    'Hello there',
    'Hope you\'re doing well',
    'Just wanted to reach out',
    'Quick update',
    'Thought you might be interested',
  ];

  const bodies = [
    'Hi, I hope this email finds you well. Just wanted to check in and see how things are going.',
    'Hello! I wanted to follow up on our previous conversation. Let me know if you have any questions.',
    'Hi there, just reaching out to see if you\'re available for a quick chat this week.',
    'Hello, I hope you\'re having a great day. I wanted to share some updates with you.',
    'Hi, just wanted to touch base and see if there\'s anything I can help you with.',
    'Hello! I thought you might find this interesting. Let me know what you think.',
    'Hi there, quick question - are you available for a brief call this week?',
    'Hello, I wanted to reach out and see how everything is going on your end.',
  ];

  return {
    subject: subjects[index % subjects.length],
    body: bodies[index % bodies.length],
  };
};


/**
 * Check how many emails have been sent today for a warmup email
 */
const getTodayEmailCount = async (warmupEmailId) => {
  try {
    // Get all jobs for this warmup email that are completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get waiting and active jobs count (these are scheduled but not sent yet)
    const waitingCount = await emailQueue.getWaitingCount();
    const activeCount = await emailQueue.getActiveCount();
    
    // Get completed jobs from today
    const completedJobs = await emailQueue.getJobs(['completed'], 0, 1000);
    const todayCompleted = completedJobs.filter(job => {
      if (job.data.warmupEmailId === warmupEmailId.toString() && job.finishedOn) {
        const finishedDate = new Date(job.finishedOn);
        finishedDate.setHours(0, 0, 0, 0);
        return finishedDate.getTime() === today.getTime();
      }
      return false;
    }).length;
    
    // Get waiting/active jobs for this warmup email
    const waitingJobs = await emailQueue.getJobs(['waiting', 'active'], 0, 1000);
    const scheduledToday = waitingJobs.filter(job => {
      return job.data.warmupEmailId === warmupEmailId.toString();
    }).length;
    
    return {
      sentToday: todayCompleted,
      scheduledToday: scheduledToday,
      totalScheduled: scheduledToday + todayCompleted,
    };
  } catch (error) {
    console.error('Error getting today email count:', error);
    return { sentToday: 0, scheduledToday: 0, totalScheduled: 0 };
  }
};

/**
 * Schedule emails for a single warmup email
 */
const scheduleWarmupEmails = async (warmupEmail) => {
  try {
    if (warmupEmail.status !== 'active') {
      return { scheduled: 0, message: `Warmup email status is ${warmupEmail.status}, skipping` };
    }

    // Check if warmup period has ended
    const startDate = new Date(warmupEmail.warmupSettings.startDate);
    const duration = warmupEmail.warmupSettings.duration || 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    if (new Date() > endDate) {
      // Mark as completed
      warmupEmail.status = 'completed';
      await warmupEmail.save();
      return { scheduled: 0, message: 'Warmup period has ended' };
    }

    // Get daily email limit
    const dailyLimit = warmupEmail.warmupSettings.dailyEmailLimit || 5;
    
    // Check how many emails have been scheduled/sent today
    const todayStats = await getTodayEmailCount(warmupEmail._id);
    console.log(`   Today's stats: ${todayStats.sentToday} sent, ${todayStats.scheduledToday} scheduled, ${todayStats.totalScheduled} total`);
    
    const remainingEmails = dailyLimit - todayStats.totalScheduled;
    
    if (remainingEmails <= 0) {
      return { 
        scheduled: 0, 
        message: `Daily limit (${dailyLimit}) already reached or scheduled`,
        todayStats,
      };
    }
    
    const recipients = getRecipientList();
    console.log(`   Available recipients: ${recipients.length}`);
    
    const emailsToSchedule = Math.min(remainingEmails, recipients.length);
    
    if (emailsToSchedule <= 0) {
      return { scheduled: 0, message: 'No emails to schedule (no recipients or limit reached)' };
    }
    
    console.log(`   Scheduling ${emailsToSchedule} email(s)...`);
    
    const scheduledJobs = [];
    const minuteInMs = 60 * 1000; // 1 minute in milliseconds
    
    // Use reasonable delays for warmup emails (5-60 minutes between emails)
    // This makes emails send more naturally without waiting hours
    const minDelayMinutes = parseInt(process.env.EMAIL_SCHEDULE_MIN_MINUTES) || 5;
    const maxDelayMinutes = parseInt(process.env.EMAIL_SCHEDULE_MAX_MINUTES) || 60;
    const minDelay = minDelayMinutes * minuteInMs;
    const maxDelay = maxDelayMinutes * minuteInMs;
    
    console.log(`   Delay range: ${minDelayMinutes}-${maxDelayMinutes} minutes`);
    
    for (let i = 0; i < emailsToSchedule; i++) {
      // Calculate delay: first email sends faster (1-5 min), others spread out
      let finalDelay;
      if (i === 0) {
        // First email: send within 1-5 minutes for faster testing
        const firstEmailMaxMinutes = Math.min(5, maxDelayMinutes);
        finalDelay = Math.floor(Math.random() * (firstEmailMaxMinutes * minuteInMs - minuteInMs) + minuteInMs);
      } else {
        // Subsequent emails: random delay between min and max
        const baseDelay = (i - 1) * (minDelay / Math.max(1, emailsToSchedule - 1)); // Space out remaining emails
        const randomVariation = Math.floor(Math.random() * (maxDelay - minDelay));
        finalDelay = Math.floor(baseDelay + minDelay + randomVariation);
        finalDelay = Math.min(finalDelay, maxDelay);
      }
      
      const recipient = recipients[i % recipients.length];
      const content = generateWarmupEmailContent(todayStats.totalScheduled + i);
      
      const job = await emailQueue.add(
        'send-email',
        {
          warmupEmailId: warmupEmail._id.toString(),
          to: recipient,
          subject: content.subject,
          body: content.body,
          from: warmupEmail.email,
        },
        {
          delay: finalDelay,
          priority: 0,
          jobId: `warmup-${warmupEmail._id}-${Date.now()}-${i}`,
        }
      );
      
      scheduledJobs.push(job.id);
      const delayMinutes = Math.round(finalDelay / 60000);
      const delaySeconds = Math.round((finalDelay % 60000) / 1000);
      console.log(`   ✓ Job ${job.id} scheduled to ${recipient} (delay: ${delayMinutes}m ${delaySeconds}s)`);
    }

    return {
      scheduled: scheduledJobs.length,
      jobIds: scheduledJobs,
      message: `Scheduled ${scheduledJobs.length} email(s)`,
      todayStats: {
        ...todayStats,
        newlyScheduled: scheduledJobs.length,
      },
    };
  } catch (error) {
    console.error(`❌ Error scheduling emails for warmup ${warmupEmail._id}:`, error);
    console.error('Stack:', error.stack);
    return { scheduled: 0, error: error.message };
  }
};

/**
 * Process all active warmup emails and schedule their emails
 */
export const processActiveWarmupEmails = async () => {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, attempting to connect...');
      const mongoURI = process.env.MONGO_URI;
      if (mongoURI) {
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
      } else {
        throw new Error('MONGO_URI is not defined');
      }
    } else {
      console.log('✅ MongoDB connection verified');
    }

    // Find all active warmup emails
    const activeWarmupEmails = await EmailWarmup.find({ status: 'active' });

    console.log(`📧 Found ${activeWarmupEmails.length} active warmup email(s)`);

    if (activeWarmupEmails.length === 0) {
      console.log('ℹ️ No active warmup emails found. Make sure you have warmup emails with status="active" in the database.');
      return {
        success: true,
        processed: 0,
        results: [],
        message: 'No active warmup emails found',
      };
    }

    const results = [];
    for (const warmupEmail of activeWarmupEmails) {
      console.log(`\n📬 Processing warmup email: ${warmupEmail.email} (ID: ${warmupEmail._id})`);
      console.log(`   Daily limit: ${warmupEmail.warmupSettings.dailyEmailLimit || 5}`);
      console.log(`   Status: ${warmupEmail.status}`);
      
      const result = await scheduleWarmupEmails(warmupEmail);
      
      if (result.scheduled > 0) {
        console.log(`   ✅ ${result.message}`);
      } else {
        console.log(`   ⚠️ ${result.message || 'No emails scheduled'}`);
      }
      
      results.push({
        warmupEmailId: warmupEmail._id.toString(),
        email: warmupEmail.email,
        ...result,
      });
    }

    const totalScheduled = results.reduce((sum, r) => sum + (r.scheduled || 0), 0);
    console.log(`\n📊 Summary: Scheduled ${totalScheduled} email(s) across ${activeWarmupEmails.length} warmup email(s)`);

    return {
      success: true,
      processed: activeWarmupEmails.length,
      totalScheduled,
      results,
    };
  } catch (error) {
    console.error('❌ Error processing active warmup emails:', error);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Start the scheduler using cron
 * @param {string} cronSchedule - Cron expression (default: every 15 minutes)
 * Default schedule runs every 15 minutes
 */
export const startScheduler = (cronSchedule = '*/15 * * * *') => {
  console.log(`🕐 Starting warmup email scheduler with cron: ${cronSchedule}`);
  
  // Validate cron expression
  if (!cron.validate(cronSchedule)) {
    console.error(`❌ Invalid cron expression: ${cronSchedule}`);
    console.error('Using default: */15 * * * * (every 15 minutes)');
    cronSchedule = '*/15 * * * *';
  }
  
  // Run immediately on start
  console.log('📊 Running initial warmup email check...');
  console.log('ℹ️ Make sure the email worker is running to process scheduled jobs');
  processActiveWarmupEmails().then((result) => {
    console.log('📊 Initial scheduler run completed:', {
      success: result.success,
      processed: result.processed,
      totalScheduled: result.totalScheduled || 0,
      timestamp: new Date().toISOString(),
    });
    if (result.totalScheduled > 0) {
      console.log(`✅ ${result.totalScheduled} email(s) scheduled. Worker will process them automatically.`);
    }
  }).catch((error) => {
    console.error('❌ Error in initial scheduler run:', error);
    console.error('Stack:', error.stack);
  });

  // Schedule cron job
  cron.schedule(cronSchedule, async () => {
    console.log(`⏰ Running scheduled warmup email check at ${new Date().toISOString()}`);
    try {
      const result = await processActiveWarmupEmails();
      console.log('📊 Scheduler result:', {
        success: result.success,
        processed: result.processed,
        timestamp: new Date().toISOString(),
      });
      
      // Log detailed results
      if (result.results && result.results.length > 0) {
        result.results.forEach((r) => {
          if (r.scheduled > 0) {
            console.log(`  ✅ Scheduled ${r.scheduled} email(s) for ${r.email || r.warmupEmailId}`);
          } else {
            console.log(`  ⚠️ No emails scheduled for ${r.email || r.warmupEmailId}: ${r.message || 'Unknown reason'}`);
          }
        });
      } else if (result.message) {
        console.log(`  ℹ️ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error in scheduled warmup email check:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  console.log(`✅ Cron scheduler started successfully`);
  console.log(`   Schedule: ${cronSchedule}`);
  console.log(`   Timezone: ${process.env.TZ || 'UTC'}`);
};

export default {
  processActiveWarmupEmails,
  startScheduler,
};

