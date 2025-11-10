import { CreditCost, ICreditCost } from '../models/creditCostModel.js';

/** Initialize credit cost collection with default values */
export const initCreditCostTable = async (): Promise<void> => {
  const count = await CreditCost.countDocuments();
  if (count === 0) {
    await CreditCost.create({ 
      email_cost_per_credit: 1,
      verification_cost_per_credit: 1,
      credits_per_usd: 100
    });
    console.log('✅ Default credit costs seeded (Email: 1, Verification: 1, Credits per USD: 100)');
  } else {
    console.log('ℹ️ Credit costs already initialized');
  }
};

/** Get the latest credit cost record */
export const getCreditCost = async (): Promise<ICreditCost | null> => {
  return await CreditCost.findOne().sort({ createdAt: -1 }).lean<ICreditCost>().exec();
};

/** Set (insert) a new credit cost entry (admin) */
export const setCreditCost = async (
  email_cost_per_credit: number,
  verification_cost_per_credit: number,
  credits_per_usd: number
): Promise<ICreditCost> => {
  if (email_cost_per_credit < 0 || verification_cost_per_credit < 0 || credits_per_usd < 0) {
    throw new Error('Credit costs cannot be negative');
  }

  const newCreditCost = new CreditCost({ 
    email_cost_per_credit,
    verification_cost_per_credit,
    credits_per_usd
  });
  await newCreditCost.save();
  return newCreditCost;
};

