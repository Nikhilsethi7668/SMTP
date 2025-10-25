import mongoose, { Schema, Document } from 'mongoose';

export interface IIPPool extends Document {
  label: string; // e.g. "marketing", "transactional"
  ip_address: string; // IPv4 or IPv6
  status: 'active' | 'warming' | 'blocked';
  warmup_stage: number;
  max_daily_send: number;
  assigned_user_id?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const IPPoolSchema = new Schema<IIPPool>(
  {
    label: { type: String, required: true, trim: true },
    ip_address: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'warming', 'blocked'],
      default: 'active',
    },
    warmup_stage: { type: Number, default: 1 },
    max_daily_send: { type: Number, default: 5000 },
    assigned_user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const IPPool = mongoose.model<IIPPool>('IPPool', IPPoolSchema);
