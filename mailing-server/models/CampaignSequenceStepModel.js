import mongoose from "mongoose";
const { Schema } = mongoose;

const StepSchema = new Schema(
  {
    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true, // Step order: 1, 2, 3...
    },

    // Optional fallback content (variants are primary source)
    subject: { type: String, default: null },
    body: { type: String, default: null }, // HTML content
    text: { type: String, default: null }, // Plain text content
  },
  { timestamps: true }
);

export const CampaignSequenceStep =
  mongoose.models.CampaignSequenceStep ||
  mongoose.model("CampaignSequenceStep", StepSchema);
