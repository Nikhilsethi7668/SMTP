import mongoose, { Schema, Document } from "mongoose";

export interface IEmailWarmup extends Document {
  userId: mongoose.Types.ObjectId;
  emailAccountId: mongoose.Types.ObjectId;
  email: string;
  status: "pending" | "active" | "paused" | "completed" | "failed";
  warmupSettings: {
    dailyEmailLimit: number;
    replyRate: number;
    openRate: number;
    startDate: Date;
    duration: number; // in days
  };
  stats: {
    emailsSent: number;
    emailsReceived: number;
    repliesReceived: number;
    opensReceived: number;
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailWarmupSchema = new Schema<IEmailWarmup>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emailAccountId: {
      type: Schema.Types.ObjectId,
      ref: "EmailAccount",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "paused", "completed", "failed"],
      default: "pending",
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

export const EmailWarmup = mongoose.model<IEmailWarmup>("EmailWarmup", EmailWarmupSchema);

