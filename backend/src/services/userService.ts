import { User, IUser } from "../models/userModel.js";
import { Org, IOrg } from "../models/organizationModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

/**
 * Create organization (if not exists) and first admin user
 */
export const createOrgAndAdmin = async (
  orgName: string,
  full_name: string,
  username: string,
  password: string,
  email?: string
): Promise<IUser> => {
  let org = await Org.findOne({ name: orgName });
  if (!org) {
    org = await Org.create({ name: orgName });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    org_id: org._id,
    full_name,
    company_name: orgName,
    username,
    password_hash,
    email,
    role: "admin",
  });

  return user;
};

/**
 * Add a user to an existing organization
 */
export const addUser = async (
  org_id: string,
  full_name: string,
  username: string,
  password: string,
  email?: string
): Promise<IUser> => {
  const password_hash = await bcrypt.hash(password, 10);

  const org = await Org.findById(org_id);
  if (!org) throw new Error("Organization not found");

  const user = await User.create({
    org_id,
    full_name,
    company_name: org.name,
    username,
    password_hash,
    email,
    role: "user",
  });

  return user;
};

/**
 * Get user by username (lean)
 */
export const getUserByUsername = async (username: string) => {
  return await User.findOne({ username }).lean();
};

/**
 * Get user by email (lean)
 */
export const getUserByEmail = async (email: string) => {
  return await User.findOne({ email }).lean();
};

/**
 * Validate password: returns user object if valid, otherwise false
 */
export const validatePassword = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) return false;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user.toObject() : false;
};

/**
 * Increment usage counters for a user
 */
export const updateUsage = async (username: string, count = 1) => {
  await User.updateOne(
    { username },
    { $inc: { used_today: count, used_month: count }, $set: { updatedAt: new Date() } }
  );
};

/**
 * Reset daily usage for all users
 */
export const resetDailyUsage = async () => {
  await User.updateMany({}, { $set: { used_today: 0, updatedAt: new Date() } });
};

/**
 * Reset monthly usage for all users
 */
export const resetMonthlyUsage = async () => {
  await User.updateMany({}, { $set: { used_month: 0, updatedAt: new Date() } });
};

/**
 * Delete user by id
 */
export const deleteUser = async (id: mongoose.Types.ObjectId) => {
  await User.deleteOne({ _id: id });
};

/**
 * Mark user as verified and return a minimal projection
 */
export const markUserAsVerified = async (email: string) => {
  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { is_verified: true, updatedAt: new Date() } },
    { new: true, projection: { _id: 1, username: 1, email: 1, is_verified: 1 } }
  );
  return updated?.toObject();
};

/**
 * Check if a user is verified (returns boolean)
 */
export const isUserVerified = async (email: string) => {
  const user = await User.findOne({ email }, { is_verified: 1 });
  return user?.is_verified || false;
};

/**
 * List all users (lean) with chosen fields
 */
export const getAllUsers = async () => {
  return await User.find(
    {},
    {
      username: 1,
      email: 1,
      full_name: 1,
      company_name: 1,
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

/**
 * Update refresh token and expiry for a user (returns minimal projection)
 */
export const updateRefreshToken = async (email: string, refreshToken: string, expiresAt: Date) => {
  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { refresh_token: refreshToken, refresh_token_expires_at: expiresAt, updatedAt: new Date() } },
    { new: true, projection: { _id: 1, email: 1, username: 1, role: 1 } }
  );
  return updated?.toObject();
};

/**
 * Find user by refresh token (only valid, unexpired tokens)
 */
export const findByRefreshToken = async (token: string) => {
  const user = await User.findOne({
    refresh_token: token,
    refresh_token_expires_at: { $gt: new Date() },
  });
  return user?.toObject();
};

/**
 * Optionally: export all as a grouped object for convenience
 */
export default {
  createOrgAndAdmin,
  addUser,
  getUserByUsername,
  getUserByEmail,
  validatePassword,
  updateUsage,
  resetDailyUsage,
  resetMonthlyUsage,
  deleteUser,
  markUserAsVerified,
  isUserVerified,
  getAllUsers,
  updateRefreshToken,
  findByRefreshToken,
};
