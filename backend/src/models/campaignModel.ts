import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;

  type?: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  subject?: string;

  send_at?: Date;
  started_at?: Date;
  finished_at?: Date;
  timezone?: string;

  ip_pool?: string;
  rate_limit?: number;
  daily_quota?: number;

  metrics_sent?: number;
  metrics_delivered?: number;
  metrics_opened?: number;
  metrics_clicked?: number;
  metrics_bounced?: number;
  metrics_complaints?: number;

  status?: string;
  priority?: number;
  archived?: boolean;

  delivery_log_collection?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },

    type: { type: String, default: null },
    from_name: { type: String, default: null },
    from_email: { type: String, default: null },
    reply_to: { type: String, default: null },
    subject: { type: String, default: null },

    send_at: { type: Date, default: null },
    started_at: { type: Date, default: null },
    finished_at: { type: Date, default: null },
    timezone: { type: String, default: null },

    ip_pool: { type: String, default: null },
    rate_limit: { type: Number, default: null },
    daily_quota: { type: Number, default: null },

    metrics_sent: { type: Number, default: null },
    metrics_delivered: { type: Number, default: null },
    metrics_opened: { type: Number, default: null },
    metrics_clicked: { type: Number, default: null },
    metrics_bounced: { type: Number, default: null },
    metrics_complaints: { type: Number, default: null },

    status: { type: String, default: "draft" },
    priority: { type: Number, default: null },
    archived: { type: Boolean, default: null },

    delivery_log_collection: { type: String, default: null },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
