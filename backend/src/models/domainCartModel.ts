import mongoose, { Schema, Document } from "mongoose";

/**
 * Domain Cart Model
 * Stores domains that users have added to their cart for purchase
 */

export interface IDomainCart extends Document {
  user_id: mongoose.Types.ObjectId;
  domain: string;
  sld: string;
  tld: string;
  available: boolean;
  premium?: boolean;
  
  // Pricing information
  registrationPrice: number;
  renewalPrice?: number;
  transferPrice?: number;
  totalPrice: number;
  years: number; // Number of years to register
  
  // Enom API related
  enomItemNumber?: string; // Item number from Enom cart if added via API
  enomCartId?: string; // Cart ID from Enom if synced
  rrpCode?: string; // Response code from Enom check
  
  // Status
  status: "active" | "purchased" | "removed" | "expired";
  
  // Additional metadata
  addedAt: Date;
  purchasedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DomainCartSchema = new Schema<IDomainCart>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sld: {
      type: String,
      required: true,
      trim: true,
    },
    tld: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      required: true,
      default: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    registrationPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    renewalPrice: {
      type: Number,
    },
    transferPrice: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    years: {
      type: Number,
      required: true,
      default: 1,
    },
    enomItemNumber: {
      type: String,
      trim: true,
    },
    enomCartId: {
      type: String,
      trim: true,
    },
    rrpCode: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "purchased", "removed", "expired"],
      default: "active",
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    purchasedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
DomainCartSchema.index({ user_id: 1, status: 1 });
DomainCartSchema.index({ user_id: 1, domain: 1 }, { unique: true });
DomainCartSchema.index({ enomItemNumber: 1 });

export const DomainCart = mongoose.model<IDomainCart>("DomainCart", DomainCartSchema);

