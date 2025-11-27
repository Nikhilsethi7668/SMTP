import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;

  type?: string;
  from_name?: string;

  // UPDATED → Array of strings
  from_email?: string[];

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

  // NEW FIELDS
  stop_on_reply?: boolean;           // Stop sending emails on reply
  open_tracking?: boolean;           // Open tracking
  send_text_only?: boolean;          // Send emails as text-only
  first_email_text_only?: boolean;   // First email text-only
  daily_limit?: number;              // Daily sending limit

  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },

    type: { type: String, default: null },
    from_name: { type: String, default: null },

    // UPDATED → array of strings
    from_email: { type: [String], default: [] },

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

    // NEW FIELDS
    stop_on_reply: { type: Boolean, default: false },
    open_tracking: { type: Boolean, default: true },
    send_text_only: { type: Boolean, default: false },
    first_email_text_only: { type: Boolean, default: false },
    daily_limit: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Campaign =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
