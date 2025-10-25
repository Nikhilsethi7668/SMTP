import { Pricing, IPricing } from '../models/pricingModel.js';

/** ✅ Initialize pricing collection with a default entry */
export const initPricingTable = async (): Promise<void> => {
  const count = await Pricing.countDocuments();
  if (count === 0) {
    await Pricing.create({ rupees: 1, credits: 10 });
    console.log('✅ Default pricing seeded (1 INR = 10 credits)');
  } else {
    console.log('ℹ️ Pricing already initialized');
  }
};

/** ✅ Get the latest pricing record */
export const getPricing = async (): Promise<IPricing | null> => {
  return await Pricing.findOne().sort({ createdAt: -1 }).lean<IPricing>().exec();
};

/** ✅ Set (insert) a new pricing entry (admin) */
export const setPricing = async (rupees: number, credits: number): Promise<IPricing> => {
  const newPricing = new Pricing({ rupees, credits });
  await newPricing.save();
  return newPricing;
};
