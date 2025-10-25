import { User, IUser } from "../models/userModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// ✅ Create user with hashed password
export const createUser = async (userData: any): Promise<Partial<IUser>> => {
  const hash = await bcrypt.hash(userData.password, 10);
  const user = new User({
    org_id: userData.org_id,
    username: userData.username,
    password_hash: hash,
    email: userData.email,
    role: userData.role || "user",
    daily_quota: userData.daily_quota || 1000,
    monthly_quota: userData.monthly_quota || 10000,
    rate_limit: userData.rate_limit || 5,
    dedicated_ip_id: userData.dedicated_ip_id,
  });
  await user.save();
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
};

// ✅ Get user by username
export const getUserByUsername = async (username: string) => {
  return await User.findOne({ username }).lean();
};

// ✅ Get user by email
export const getUserByEmail = async (email: string) => {
  return await User.findOne({ email }).lean();
};

// ✅ Validate password
export const validatePassword = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) return false;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user.toObject() : false;
};

// ✅ Update usage quotas
export const updateUsage = async (username: string, count = 1) => {
  await User.updateOne(
    { username },
    {
      $inc: { used_today: count, used_month: count },
      $set: { updatedAt: new Date() },
    }
  );
};

// ✅ Reset daily usage
export const resetDailyUsage = async () => {
  await User.updateMany({}, { $set: { used_today: 0, updatedAt: new Date() } });
};

// ✅ Reset monthly usage
export const resetMonthlyUsage = async () => {
  await User.updateMany({}, { $set: { used_month: 0, updatedAt: new Date() } });
};

// ✅ Delete user
export const deleteUser = async (id: mongoose.Types.ObjectId) => {
  await User.deleteOne({ _id: id });
};

// ✅ Mark user as verified
export const markUserAsVerified = async (email: string) => {
  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { is_verified: true, updatedAt: new Date() } },
    { new: true, projection: { _id: 1, username: 1, email: 1, is_verified: 1 } }
  );
  return updated?.toObject();
};

// ✅ Check if user is verified
export const isUserVerified = async (email: string) => {
  const user = await User.findOne({ email }, { is_verified: 1 });
  return user?.is_verified || false;
};

// ✅ List all users (admin)
export const getAllUsers = async () => {
  return await User.find(
    {},
    {
      username: 1,
      email: 1,
      role: 1,
      daily_quota: 1,
      monthly_quota: 1,
      used_today: 1,
      used_month: 1,
      rate_limit: 1,
      is_active: 1,
      is_verified: 1,
      createdAt: 1,
      updatedAt: 1,
    }
  ).lean();
};

// ✅ Update refresh token
export const updateRefreshToken = async (
  email: string,
  refreshToken: string,
  expiresAt: Date
) => {
  const updated = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        refresh_token: refreshToken,
        refresh_token_expires_at: expiresAt,
        updatedAt: new Date(),
      },
    },
    { new: true, projection: { _id: 1, email: 1, username: 1, role: 1 } }
  );
  return updated?.toObject();
};

// ✅ Find user by refresh token
export const findByRefreshToken = async (token: string) => {
  const user = await User.findOne({
    refresh_token: token,
    refresh_token_expires_at: { $gt: new Date() },
  });
  return user?.toObject();
};
