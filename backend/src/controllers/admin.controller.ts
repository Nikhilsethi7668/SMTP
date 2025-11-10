import { Request, Response } from 'express';
import { setPricing } from '../services/pricingService.js';
import { setCreditCost } from '../services/creditCostService.js';

export const updatePricing = async (req: Request, res: Response) => {
  const { rupees, credits } = req.body;

  if (!rupees || !credits || isNaN(rupees) || isNaN(credits) || rupees <= 0 || credits <= 0) {
    return res.status(400).json({ error: 'Invalid pricing values' });
  }

  try {
    const newPricing = await setPricing(rupees, credits);
    res.json(newPricing);
  } catch (error) {
    console.error('Error setting pricing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCreditCost = async (req: Request, res: Response) => {
  const { email_cost_per_credit, verification_cost_per_credit, credits_per_usd } = req.body;

  if (
    email_cost_per_credit === undefined || 
    verification_cost_per_credit === undefined ||
    credits_per_usd === undefined ||
    isNaN(email_cost_per_credit) || 
    isNaN(verification_cost_per_credit) || 
    isNaN(credits_per_usd) ||
    email_cost_per_credit < 0 || 
    verification_cost_per_credit < 0 ||
    credits_per_usd < 0
  ) {
    return res.status(400).json({ error: 'Invalid credit cost values' });
  }

  try {
    const newCreditCost = await setCreditCost(email_cost_per_credit, verification_cost_per_credit, credits_per_usd);
    res.json(newCreditCost);
  } catch (error: any) {
    console.error('Error setting credit cost:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
