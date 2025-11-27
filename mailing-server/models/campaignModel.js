import mongoose from "mongoose";
const { Schema } = mongoose;

const CampaignSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },

    type: { type: String, default: null },
    from_name: { type: String, default: null },

    // ARRAY of strings
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
  mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
