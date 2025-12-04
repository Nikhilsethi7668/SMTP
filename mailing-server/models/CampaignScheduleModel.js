import mongoose from "mongoose";
const { Schema } = mongoose;

const CampaignScheduleSchema = new Schema(
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
  mongoose.model("CampaignSchedule", CampaignScheduleSchema);
