import { Blacklist, IBlacklist } from '../models/blacklistModel.js';

/** ✅ Add new blacklist entry */
export const addBlacklistEntry = async (
  type: 'domain' | 'ip' | 'keyword',
  value: string,
  reason?: string
): Promise<IBlacklist> => {
  const entry = new Blacklist({ type, value, reason });
  return await entry.save();
};

/** ✅ Check if a value is blacklisted */
export const isBlacklisted = async (
  type: 'domain' | 'ip' | 'keyword',
  value: string
): Promise<boolean> => {
  const existing = await Blacklist.findOne({ type, value });
  return !!existing;
};

/** ✅ Fetch all blacklist entries (optional filtering by type) */
export const getBlacklist = async (
  type?: 'domain' | 'ip' | 'keyword'
): Promise<IBlacklist[]> => {
  const filter = type ? { type } : {};
  return await Blacklist.find(filter).sort({ createdAt: -1 });
};

/** ✅ Remove blacklist entry */
export const removeBlacklistEntry = async (id: string): Promise<void> => {
  await Blacklist.findByIdAndDelete(id);
};
