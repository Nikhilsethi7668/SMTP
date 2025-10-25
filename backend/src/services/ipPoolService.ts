import { IPPool, IIPPool } from '../models/ipPoolModel.js';
import mongoose from 'mongoose';

/** ✅ Create a new IP record */
export const addIP = async (data: Partial<IIPPool>): Promise<IIPPool> => {
  const ip = new IPPool(data);
  return await ip.save();
};

/** ✅ Fetch all IPs */
export const getAllIPs = async (): Promise<IIPPool[]> => {
  return await IPPool.find().sort({ _id: 1 });
};

/** ✅ Get next available IP for rotation (random active & unassigned) */
export const getNextAvailableIP = async (): Promise<IIPPool | null> => {
  const count = await IPPool.countDocuments({
    status: 'active',
    assigned_user_id: null,
  });

  if (count === 0) return null;

  const random = Math.floor(Math.random() * count);
  const ip = await IPPool.findOne({
    status: 'active',
    assigned_user_id: null,
  }).skip(random);
  return ip;
};

/** ✅ Assign IP to a user */
export const assignIPToUser = async (ip_id: string, user_id: string): Promise<void> => {
  await IPPool.findByIdAndUpdate(ip_id, {
    assigned_user_id: new mongoose.Types.ObjectId(user_id),
    updatedAt: new Date(),
  });
};

/** ✅ Rotate IP (update status) */
export const rotateIPStatus = async (ip_id: string, newStatus: 'active' | 'warming' | 'blocked'): Promise<void> => {
  await IPPool.findByIdAndUpdate(ip_id, {
    status: newStatus,
    updatedAt: new Date(),
  });
};

/** ✅ Update warm-up stage and daily cap */
export const updateWarmup = async (
  ip_id: string,
  stage: number,
  max_daily_send: number
): Promise<void> => {
  await IPPool.findByIdAndUpdate(ip_id, {
    warmup_stage: stage,
    max_daily_send,
    updatedAt: new Date(),
  });
};
