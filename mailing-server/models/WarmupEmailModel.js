import mongoose from 'mongoose';

const { Schema } = mongoose;

const EmailWarmupSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed', 'failed'],
      default: 'pending',
    },
    warmupSettings: {
      dailyEmailLimit: {
        type: Number,
        default: 5,
        min: 1,
        max: 50,
      },
      replyRate: {
        type: Number,
        default: 30,
        min: 0,
        max: 100,
      },
      openRate: {
        type: Number,
        default: 40,
        min: 0,
        max: 100,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      duration: {
        type: Number,
        default: 30,
        min: 7,
        max: 90,
      },
    },
    stats: {
      emailsSent: {
        type: Number,
        default: 0,
      },
      emailsReceived: {
        type: Number,
        default: 0,
      },
      repliesReceived: {
        type: Number,
        default: 0,
      },
      opensReceived: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
EmailWarmupSchema.index({ userId: 1, status: 1 });
EmailWarmupSchema.index({ emailAccountId: 1 });

export const EmailWarmup = mongoose.model('EmailWarmup', EmailWarmupSchema);

