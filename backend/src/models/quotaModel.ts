import mongoose, { Schema, Document } from "mongoose";

export interface IQuota extends Document {
  user_id: mongoose.Types.ObjectId;
  daily_limit: number;
  monthly_limit: number;
  credits: number;
  emails_sent_today: number;
  emails_sent_this_month: number;
  last_reset_date: Date;
  last_month_reset: Date;
  rate_limit_per_minute: number;
  last_sent_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuotaSchema = new Schema<IQuota>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    daily_limit: { type: Number, default: 1000 },
    monthly_limit: { type: Number, default: 30000 },
    credits: { type: Number, default: 0 },
    emails_sent_today: { type: Number, default: 0 },
    emails_sent_this_month: { type: Number, default: 0 },
    last_reset_date: { type: Date, default: () => new Date() },
    last_month_reset: { type: Date, default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    rate_limit_per_minute: { type: Number, default: 60 },
    last_sent_at: { type: Date },
  },
  { timestamps: true }
);

export const Quota = mongoose.model<IQuota>("Quota", QuotaSchema);
