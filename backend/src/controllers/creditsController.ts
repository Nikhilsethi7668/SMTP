import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getOrCreateCredit } from '../services/creditService.js';
import { getCreditCost } from '../services/creditCostService.js';

export const getCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const credit = await getOrCreateCredit(userObjectId);
    const creditCost = await getCreditCost();

    if (!credit) {
      // If credit doesn't exist (shouldn't happen after getOrCreateCredit), return default values
      return res.json({
        currentBalance: 0,
        emailCredits: 0,
        verificationCredits: 0,
        totalCredits: 0,
        creditCosts: {
          emailCostPerCredit: creditCost?.email_cost_per_credit || 1,
          verificationCostPerCredit: creditCost?.verification_cost_per_credit || 1,
          creditsPerUsd: creditCost?.credits_per_usd || 100,
        },
      });
    }

    res.json({
      currentBalance: credit.total_credits || 0,
      emailCredits: credit.email_credits || 0,
      verificationCredits: credit.verification_credits || 0,
      totalCredits: credit.total_credits || 0,
      creditCosts: {
        emailCostPerCredit: creditCost?.email_cost_per_credit || 1,
        verificationCostPerCredit: creditCost?.verification_cost_per_credit || 1,
        creditsPerUsd: creditCost?.credits_per_usd || 100,
      },
    });
  } catch (error: any) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

