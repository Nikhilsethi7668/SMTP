import mongoose, { Schema, Document } from 'mongoose';

/**
 * Registrant Information Model
 * Stores user's domain registration details for auto-filling forms
 */
export interface IRegistrantInfo extends Document {
  user_id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  organizationName?: string;
  isDefault: boolean; // Mark one as default for auto-fill
  createdAt: Date;
  updatedAt: Date;
}

const RegistrantInfoSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address1: {
      type: String,
      required: true,
      trim: true,
    },
    address2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    stateProvince: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'US',
    },
    organizationName: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one default per user
RegistrantInfoSchema.index({ user_id: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

// Compound index for user queries
RegistrantInfoSchema.index({ user_id: 1, createdAt: -1 });

export const RegistrantInfo = mongoose.model<IRegistrantInfo>('RegistrantInfo', RegistrantInfoSchema);

