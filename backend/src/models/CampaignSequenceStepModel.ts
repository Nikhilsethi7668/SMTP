import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignSequenceStep extends Document {
  campaign_id: mongoose.Types.ObjectId;

  name: string;
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

const StepSchema = new Schema<ICampaignSequenceStep>(
  {
    campaign_id: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },

    name: { type: String, required: true },
    order: { type: Number, required: true } // for sorting Step 1, Step 2, Step 3
  },
  { timestamps: true }
);

export const CampaignSequenceStep = mongoose.model<ICampaignSequenceStep>(
  "CampaignSequenceStep",
  StepSchema
);
