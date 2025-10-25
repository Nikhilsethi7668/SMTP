import { Log, ILog } from '../models/logModel.js';
import mongoose from 'mongoose';

/** ✅ Add a log entry */
export const addLog = async (data: Partial<ILog>): Promise<ILog> => {
  const log = new Log(data);
  return await log.save();
};

/** ✅ Fetch logs (optionally by user) */
export const getLogs = async (user_id: string | null = null, limit: number = 100): Promise<ILog[]> => {
  const query = user_id ? { user_id: new mongoose.Types.ObjectId(user_id) } : {};
  return await Log.find(query).sort({ createdAt: -1 }).limit(limit);
};

/** ✅ Fetch logs by status */
export const getLogsByStatus = async (status: string, limit: number = 100): Promise<ILog[]> => {
  return await Log.find({ status }).sort({ createdAt: -1 }).limit(limit);
};

/** ✅ Delete old logs (cleanup) */
export const deleteOldLogs = async (days: number = 30): Promise<void> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  await Log.deleteMany({ createdAt: { $lt: cutoff } });
};
