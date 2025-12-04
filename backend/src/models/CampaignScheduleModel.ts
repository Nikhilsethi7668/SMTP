import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignSchedule extends Document {
  campaign_id: mongoose.Types.ObjectId;
  name: string;

  start_date?: Date | null;
  end_date?: Date | null;

  from_time?: string | null;
  to_time?: string | null;
  timezone?: string | null;

  days?: string[];
  archived?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CampaignScheduleSchema = new Schema<ICampaignSchedule>(
  {
    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    name: { type: String, required: true },

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    from_time: { type: String, default: null },
    to_time: { type: String, default: null },
    timezone: { type: String, default: null },

    days: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [],
    },

    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CampaignSchedule =
  mongoose.models.CampaignSchedule ||
  mongoose.model<ICampaignSchedule>(
    "CampaignSchedule",
    CampaignScheduleSchema
  );
