import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklist extends Document {
  type: 'domain' | 'ip' | 'keyword';
  value: string;
  reason?: string;
  createdAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>(
  {
    type: {
      type: String,
      enum: ['domain', 'ip', 'keyword'],
      required: true,
    },
    value: {
      type: String,
      required: true,
      unique: true, // prevent duplicates
      trim: true,
    },
    reason: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Blacklist = mongoose.model<IBlacklist>('Blacklist', BlacklistSchema);
