import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { getPricing } from '../models/pricingModel.js';
import { addCredits } from '../models/quotaModel.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { amount, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const pricing = await getPricing();
    if (!pricing) {
      return res.status(500).json({ error: 'Pricing not configured' });
    }

    const creditsToPurchase = Math.floor((amount / pricing.rupees) * pricing.credits);
    const amountInPaise = Math.round(amount * 100);

    if (creditsToPurchase <= 0) {
      return res.status(400).json({ error: 'Amount is too low to purchase any credits' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Credits',
              description: `Purchase of ${creditsToPurchase} credits`,
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: userId,
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

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);

    if (session.payment_status === 'paid') {
      const userId = parseInt(session.metadata!.userId, 10);
      const credits = parseInt(session.metadata!.credits, 10);

      if (userId && credits) {
        await addCredits(userId, credits);
        // Redirect to a frontend success page
        return res.redirect(`${process.env.CLIENT_URL}/payment-success`);
      }
    }

    // If payment not paid or metadata is missing, redirect to a failure page
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};
