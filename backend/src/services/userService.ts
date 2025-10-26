import { User, IUser } from "../models/userModel.js";
import { Org, IOrg } from "../models/organizationModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export class UserService {
  // ✅ Create organization + first admin
  static async createOrgAndAdmin(
    orgName: string,
    full_name: string,
    username: string,
    password: string,
    email?: string
  ): Promise<IUser> {
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
  }

  // ✅ Add user to existing org
  static async addUser(
    org_id: string,
    full_name: string,
    username: string,
    password: string,
    email?: string
  ): Promise<IUser> {
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
  }

  // ✅ Get user by username
  static async getUserByUsername(username: string) {
    return await User.findOne({ username }).lean();
  }

  // ✅ Get user by email
  static async getUserByEmail(email: string) {
    return await User.findOne({ email }).lean();
  }

  // ✅ Validate password
  static async validatePassword(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) return false;
    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? user.toObject() : false;
  }

  // ✅ Update usage quotas
  static async updateUsage(username: string, count = 1) {
    await User.updateOne(
      { username },
      { $inc: { used_today: count, used_month: count }, $set: { updatedAt: new Date() } }
    );
  }

  // ✅ Reset daily usage
  static async resetDailyUsage() {
    await User.updateMany({}, { $set: { used_today: 0, updatedAt: new Date() } });
  }

  // ✅ Reset monthly usage
  static async resetMonthlyUsage() {
    await User.updateMany({}, { $set: { used_month: 0, updatedAt: new Date() } });
  }

  // ✅ Delete user
  static async deleteUser(id: mongoose.Types.ObjectId) {
    await User.deleteOne({ _id: id });
  }

  // ✅ Mark user as verified
  static async markUserAsVerified(email: string) {
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: { is_verified: true, updatedAt: new Date() } },
      { new: true, projection: { _id: 1, username: 1, email: 1, is_verified: 1 } }
    );
    return updated?.toObject();
  }

  // ✅ Check if user is verified
  static async isUserVerified(email: string) {
    const user = await User.findOne({ email }, { is_verified: 1 });
    return user?.is_verified || false;
  }

  // ✅ List all users
  static async getAllUsers() {
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
  }

  // ✅ Update refresh token
  static async updateRefreshToken(email: string, refreshToken: string, expiresAt: Date) {
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: { refresh_token: refreshToken, refresh_token_expires_at: expiresAt, updatedAt: new Date() } },
      { new: true, projection: { _id: 1, email: 1, username: 1, role: 1 } }
    );
    return updated?.toObject();
  }

  // ✅ Find user by refresh token
  static async findByRefreshToken(token: string) {
    const user = await User.findOne({
      refresh_token: token,
      refresh_token_expires_at: { $gt: new Date() },
    });
    return user?.toObject();
  }
}
