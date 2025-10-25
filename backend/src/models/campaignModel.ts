import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  user_id: mongoose.Types.ObjectId; // assuming relation to Users collection
  name: string;
  type: string;
  from_name?: string;
  from_email: string;
  reply_to?: string;
  subject: string;

  send_at?: Date;
  started_at?: Date;
  finished_at?: Date;
  timezone: string;

  ip_pool: string;
  rate_limit: number;
  daily_quota: number;

  metrics_sent: number;
  metrics_delivered: number;
  metrics_opened: number;
  metrics_clicked: number;
  metrics_bounced: number;
  metrics_complaints: number;

  status: string;
  priority: number;
  archived: boolean;

  delivery_log_collection?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'marketing' },
    from_name: { type: String },
    from_email: { type: String, required: true },
    reply_to: { type: String },
    subject: { type: String, required: true },

    send_at: { type: Date },
    started_at: { type: Date },
    finished_at: { type: Date },
    timezone: { type: String, default: 'Asia/Kolkata' },

    ip_pool: { type: String, default: 'shared' },
    rate_limit: { type: Number, default: 5 },
    daily_quota: { type: Number, default: 10000 },

    metrics_sent: { type: Number, default: 0 },
    metrics_delivered: { type: Number, default: 0 },
    metrics_opened: { type: Number, default: 0 },
    metrics_clicked: { type: Number, default: 0 },
    metrics_bounced: { type: Number, default: 0 },
    metrics_complaints: { type: Number, default: 0 },

    status: { type: String, default: 'draft' },
    priority: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },

    delivery_log_collection: { type: String },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
