import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignSequenceVariant extends Document {
  step_id: mongoose.Types.ObjectId;
  campaign_id: mongoose.Types.ObjectId;

  subject: string;
  body: string;

  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<ICampaignSequenceVariant>(
  {
    step_id: { type: Schema.Types.ObjectId, ref: "CampaignSequenceStep", required: true },
    campaign_id: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },

    subject: { type: String, required: true },
    body: { type: String, required: true }
  },
  { timestamps: true }
);

export const CampaignSequenceVariant = mongoose.model<ICampaignSequenceVariant>(
  "CampaignSequenceVariant",
  VariantSchema
);
