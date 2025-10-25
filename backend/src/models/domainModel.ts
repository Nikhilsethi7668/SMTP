import mongoose, { Schema, Document } from 'mongoose';

export interface IDomain extends Document {
  user_id: mongoose.Types.ObjectId;
  domain_name: string;
  dkim_selector: string;
  dkim_public_key?: string;
  dkim_private_key?: string;
  spf_record?: string;
  dmarc_record?: string;
  verified: boolean;
  last_verified_at?: Date;
  status: 'pending' | 'verified' | 'failed' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain_name: { type: String, required: true, unique: true, trim: true },
    dkim_selector: { type: String, default: 'default' },
    dkim_public_key: { type: String },
    dkim_private_key: { type: String },
    spf_record: { type: String },
    dmarc_record: { type: String },
    verified: { type: Boolean, default: false },
    last_verified_at: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'disabled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Domain = mongoose.model<IDomain>('Domain', DomainSchema);
