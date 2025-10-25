import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  user_id?: mongoose.Types.ObjectId;
  sender_email: string;
  recipient_email: string;
  subject?: string;
  status: 'pending' | 'sent' | 'rejected' | 'deferred' | 'failed';
  ip_address?: string;
  reason?: string;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    sender_email: { type: String, required: true, trim: true },
    recipient_email: { type: String, required: true, trim: true },
    subject: { type: String },
    status: {
      type: String,
      enum: ['pending', 'sent', 'rejected', 'deferred', 'failed'],
      default: 'pending',
    },
    ip_address: { type: String },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Log = mongoose.model<ILog>('Log', LogSchema);
