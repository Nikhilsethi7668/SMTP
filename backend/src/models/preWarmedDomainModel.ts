import mongoose, { Schema, Document } from "mongoose";

export interface IPreWarmedEmail {
  email: string;
  persona: string;
  provider: "gmail" | "outlook" | "custom";
  price: number;
}

export interface IPreWarmedDomain extends Document {
  domain: string;
  emails: IPreWarmedEmail[];
  forwarding?: string;
  userId?: mongoose.Types.ObjectId;
  domainPrice: number; // Annual domain price
  emailPrice: number; // Monthly price per email
  status: "available" | "reserved" | "purchased";
  reservedUntil?: Date;
  reservedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PreWarmedEmailSchema = new Schema<IPreWarmedEmail>({
  email: { type: String, required: true },
  persona: { type: String, required: true },
  provider: { type: String, enum: ["gmail", "outlook", "custom"], default: "gmail" },
  price: { type: Number, required: true, default: 10 },
}, { _id: false });

const PreWarmedDomainSchema = new Schema<IPreWarmedDomain>(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emails: {
      type: [PreWarmedEmailSchema],
      default: [],
    },
    forwarding: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    domainPrice: {
      type: Number,
      required: true,
      default: 15, // Annual price
    },
    emailPrice: {
      type: Number,
      required: true,
      default: 10, // Monthly price per email
    },
    status: {
      type: String,
      enum: ["available", "reserved", "purchased"],
      default: "available",
    },
    reservedUntil: {
      type: Date,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for faster queries
PreWarmedDomainSchema.index({ status: 1, domain: 1 });
PreWarmedDomainSchema.index({ userId: 1 });

export const PreWarmedDomain = mongoose.model<IPreWarmedDomain>("PreWarmedDomain", PreWarmedDomainSchema);

