import { Request, Response } from 'express';
import { setPricing } from '../services/pricingService.js';

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
