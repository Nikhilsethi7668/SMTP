import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from './userModel.js';

export interface IUsersEmail extends Document {
  email: string;
  user: Types.ObjectId | IUser;
  isVerified: boolean;
  verifiedAt?: Date;
  isPrimary: boolean;
  isActive: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const usersEmailSchema = new Schema<IUsersEmail>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    verificationToken: {
      type: String,
      select: false
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
      index: { expires: '24h' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

usersEmailSchema.index({ user: 1, isPrimary: 1 });
usersEmailSchema.index({ email: 1, user: 1 }, { unique: true });

const UsersEmail: Model<IUsersEmail> = mongoose.model<IUsersEmail>('UsersEmail', usersEmailSchema);

export default UsersEmail;
