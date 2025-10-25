import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: 'registration' | 'password_reset' | '2fa' | string;
  expires_at: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Automatically delete expired OTPs after 24h
OtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs for same email & purpose
OtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
