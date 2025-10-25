import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  rupees: number;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    rupees: { type: Number, required: true },
    credits: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);
