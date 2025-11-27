import mongoose from "mongoose";
const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    step_id: {
      type: Schema.Types.ObjectId,
      ref: "CampaignSequenceStep",
      required: true,
    },

    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    subject: { type: String, required: true },
    body: { type: String, required: true }, // HTML content
    text: { type: String, default: null }, // Plain text content (optional, falls back to body if not provided)
  },
  { timestamps: true }
);

export const CampaignSequenceVariant =
  mongoose.models.CampaignSequenceVariant ||
  mongoose.model("CampaignSequenceVariant", VariantSchema);
