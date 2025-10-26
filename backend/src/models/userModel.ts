import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  // org_id?: mongoose.Types.ObjectId;
  username: string;
  password_hash: string;
  role: "admin" | "user";
  email?: string;
  daily_quota: number;
  monthly_quota: number;
  used_today: number;
  used_month: number;
  rate_limit: number;
  dedicated_ip_id?: mongoose.Types.ObjectId;
  is_active: boolean;
  is_verified: boolean;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    // org_id: { type: Schema.Types.ObjectId, ref: "Org" },
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    email: { type: String, unique: true, sparse: true },
    daily_quota: { type: Number, default: 1000 },
    monthly_quota: { type: Number, default: 10000 },
    used_today: { type: Number, default: 0 },
    used_month: { type: Number, default: 0 },
    rate_limit: { type: Number, default: 5 },
    dedicated_ip_id: { type: Schema.Types.ObjectId, ref: "IPPool" },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    refresh_token: { type: String },
    refresh_token_expires_at: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
