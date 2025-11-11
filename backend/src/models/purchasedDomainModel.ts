import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchasedDomain extends Document {
  user_id: mongoose.Types.ObjectId;
  domain: string;
  sld: string;
  tld: string;
  orderId: string;
  status: 'pending' | 'active' | 'failed' | 'expired';
  years: number;
  expirationDate?: Date;
  purchaseDate: Date;
  price: number;
  registrantInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    organizationName?: string;
  };
  enomResponse?: any; // Store full Enom API response for reference
  createdAt: Date;
  updatedAt: Date;
}

const PurchasedDomainSchema = new Schema<IPurchasedDomain>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: { type: String, required: true, trim: true },
    sld: { type: String, required: true, trim: true },
    tld: { type: String, required: true, trim: true },
    orderId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'failed', 'expired'],
      default: 'pending',
    },
    years: { type: Number, required: true, default: 1 },
    expirationDate: { type: Date },
    purchaseDate: { type: Date, default: Date.now },
    price: { type: Number, required: true },
    registrantInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address1: { type: String, required: true },
      city: { type: String, required: true },
      stateProvince: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      organizationName: { type: String },
    },
    enomResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for faster queries
PurchasedDomainSchema.index({ user_id: 1, domain: 1 });
PurchasedDomainSchema.index({ orderId: 1 });

export const PurchasedDomain = mongoose.model<IPurchasedDomain>(
  'PurchasedDomain',
  PurchasedDomainSchema
);

