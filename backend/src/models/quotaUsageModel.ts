import mongoose, { Schema, Document } from "mongoose";

export interface IQuotaUsage extends Document {
  user_id: mongoose.Types.ObjectId;
  date: Date;
  emails_sent: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuotaUsageSchema = new Schema<IQuotaUsage>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, default: () => new Date(new Date().toDateString()) }, // midnight date
    emails_sent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicates for the same (user_id, date)
QuotaUsageSchema.index({ user_id: 1, date: 1 }, { unique: true });

export const QuotaUsage = mongoose.model<IQuotaUsage>("QuotaUsage", QuotaUsageSchema);
