import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './userModel.js';

export interface IKey extends Document {
  user: mongoose.Types.ObjectId | IUser;
  key: string;
  permissions: string[];
  rate_limit?: number;
  expires_at?: Date;
  last_used_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const keySchema = new mongoose.Schema<IKey>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    permissions: [{
      type: String,
      default: ['send']
    }],
    rate_limit: {
      type: Number,
      default: null
    },
    expires_at: {
      type: Date,
      default: null
    },
    last_used_at: {
      type: Date,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes
keySchema.index({ key: 1 });
keySchema.index({ user: 1 });
keySchema.index({ is_active: 1 });

const Key: Model<IKey> = mongoose.model<IKey>('Key', keySchema);

export default Key;
