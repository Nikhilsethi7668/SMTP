import mongoose, { Schema, Document } from "mongoose";

export interface ICreditCost extends Document {
  email_cost_per_credit: number; // e.g., 0.1 credits per email
  verification_cost_per_credit: number; // e.g., 0.25 credits per verification
  credits_per_usd: number; // e.g., 100 credits per 1 USD
  createdAt: Date;
  updatedAt: Date;
}

const CreditCostSchema = new Schema<ICreditCost>(
  {
    email_cost_per_credit: { 
      type: Number, 
      required: true,
      default: 0.1,
      min: 0
    },
    verification_cost_per_credit: { 
      type: Number, 
      required: true,
      default: 0.25,
      min: 0
    },
    credits_per_usd: { 
      type: Number, 
      required: true,
      default: 100,
      min: 0
    },
  },
  { timestamps: true }
);

export const CreditCost = mongoose.model<ICreditCost>("CreditCost", CreditCostSchema);

