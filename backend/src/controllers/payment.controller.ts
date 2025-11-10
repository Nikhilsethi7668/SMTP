import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { getPricing } from '../services/pricingService.js';
import { getCreditCost } from '../services/creditCostService.js';
import { addCredits as addCreditCredits } from '../services/creditService.js';
import mongoose from 'mongoose';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { amount, currency = 'usd' } = req.body;
  const user = req.user?.id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    let creditsToPurchase: number;
    let amountInSmallestUnit: number;
    let paymentCurrency: string;

    if (currency === 'usd') {
      // Use credits_per_usd from credit cost model
      const creditCost = await getCreditCost();
      if (!creditCost || !creditCost.credits_per_usd) {
        return res.status(500).json({ error: 'Credit cost not configured' });
      }
      creditsToPurchase = Math.floor(amount * creditCost.credits_per_usd);
      amountInSmallestUnit = Math.round(amount * 100); // Convert to cents
      paymentCurrency = 'usd';
    } else {
      // Use INR pricing (existing logic)
      const pricing = await getPricing();
      if (!pricing) {
        return res.status(500).json({ error: 'Pricing not configured' });
      }
      creditsToPurchase = Math.floor((amount / pricing.rupees) * pricing.credits);
      amountInSmallestUnit = Math.round(amount * 100); // Convert to paise
      paymentCurrency = 'inr';
    }

    if (creditsToPurchase <= 0) {
      return res.status(400).json({ error: 'Amount is too low to purchase any credits' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: paymentCurrency,
            product_data: {
              name: 'Credits',
              description: `Purchase of ${creditsToPurchase} credits`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: user,
        credits: creditsToPurchase,
      },
      success_url: `${process.env.BASE_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleSuccessfulPayment = async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=no_session_id`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);

    if (session.payment_status === 'paid') {
      // Get userId and credits from session metadata (stored during checkout creation)
      const userId = session.metadata?.userId;
      const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : 0;

      if (userId && credits > 0) {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        // Split purchased credits 50/50 between email and verification
        const emailCredits = Math.floor(credits * 0.5);
        const verificationCredits = credits - emailCredits;
        await addCreditCredits(userObjectId, emailCredits, verificationCredits);
        // Redirect to a frontend success page
        return res.redirect(`${process.env.CLIENT_URL}/app/dashboard/credits`);
      } else {
        console.error('Missing userId or credits in session metadata:', { userId, credits });
        return res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=missing_metadata`);
      }
    }

    // If payment not paid, redirect to a failure page
    res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=payment_not_completed`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=server_error`);
  }
};
