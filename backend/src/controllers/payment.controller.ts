import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { getPricing } from '../services/pricingService.js';
import { getCreditCost } from '../services/creditCostService.js';
import { addCredits as addCreditCredits } from '../services/creditService.js';
import { PreWarmedDomain } from '../models/unifiedDomainModel.js';
import mongoose from 'mongoose';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { amount, currency = 'usd', metadata: requestMetadata } = req.body;
  const user = req.user?.id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const amountInSmallestUnit = Math.round(amount * 100); // Convert to cents/paise
    const paymentCurrency = currency;

    // Prepare metadata
    const sessionMetadata: Record<string, string> = {
      userId: user || '',
    };

    // Determine payment type and prepare metadata
    let productName = 'Credits';
    let productDescription = '';
    let creditsToPurchase = 0;
    
    if (requestMetadata?.type === 'pre-warmed-domains') {
      // For pre-warmed domains, don't calculate credits
      productName = 'Pre-warmed Domains & Emails';
      productDescription = 'Purchase of pre-warmed email accounts';
      sessionMetadata.type = 'pre-warmed-domains';
      if (requestMetadata.orderData) {
        sessionMetadata.orderData = requestMetadata.orderData;
      }
    } else {
      // For credits purchase, calculate credits
      if (currency === 'usd') {
        // Use credits_per_usd from credit cost model
        const creditCost = await getCreditCost();
        if (!creditCost || !creditCost.credits_per_usd) {
          return res.status(500).json({ error: 'Credit cost not configured' });
        }
        creditsToPurchase = Math.floor(amount * creditCost.credits_per_usd);
      } else {
        // Use INR pricing (existing logic)
        const pricing = await getPricing();
        if (!pricing) {
          return res.status(500).json({ error: 'Pricing not configured' });
        }
        creditsToPurchase = Math.floor((amount / pricing.rupees) * pricing.credits);
      }
      
      if (creditsToPurchase <= 0) {
        return res.status(400).json({ error: 'Amount is too low to purchase any credits' });
      }
      
      productDescription = `Purchase of ${creditsToPurchase} credits`;
      sessionMetadata.credits = creditsToPurchase.toString();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: paymentCurrency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: sessionMetadata,
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
      const userId = session.metadata?.userId;
      const paymentType = session.metadata?.type;

      if (!userId) {
        console.error('Missing userId in session metadata');
        return res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=missing_user_id`);
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);

      if (paymentType === 'pre-warmed-domains') {
        // Handle pre-warmed domain purchase
        try {
          const orderData = session.metadata?.orderData
            ? JSON.parse(session.metadata.orderData)
            : null;

          if (orderData && orderData.domains) {
            // Purchase each domain
            for (const domainOrder of orderData.domains) {
              const domainDoc = await PreWarmedDomain.findOne({
                domain: domainOrder.domain,
                $or: [
                  { status: 'available' },
                  { status: 'reserved', reservedBy: userObjectId },
                ],
              });

              if (domainDoc) {
                // Filter emails to only include selected ones
                const selectedEmails = domainDoc.emails.filter((email) =>
                  domainOrder.selectedEmails.includes(email.email)
                );

                await PreWarmedDomain.findOneAndUpdate(
                  {
                    domain: domainOrder.domain,
                    $or: [
                      { status: 'available' },
                      { status: 'reserved', reservedBy: userObjectId },
                    ],
                  },
                  {
                    userId: userObjectId,
                    forwarding: domainOrder.forwarding || undefined,
                    emails: selectedEmails, // Only keep selected emails
                    status: 'purchased',
                    reservedUntil: undefined,
                    reservedBy: undefined,
                  }
                );
              }
            }
          }
          return res.redirect(`${process.env.CLIENT_URL}/app/dashboard/accounts`);
        } catch (error) {
          console.error('Error purchasing pre-warmed domains:', error);
          return res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=domain_purchase_failed`);
        }
      } else {
        // Handle credits purchase (existing logic)
        const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : 0;

        if (credits > 0) {
          // Split purchased credits 50/50 between email and verification
          const emailCredits = Math.floor(credits * 0.5);
          const verificationCredits = credits - emailCredits;
          await addCreditCredits(userObjectId, emailCredits, verificationCredits);
          // Redirect to a frontend success page
          return res.redirect(`${process.env.CLIENT_URL}/app/dashboard/credits`);
        } else {
          console.error('Missing credits in session metadata');
          return res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=missing_metadata`);
        }
      }
    }

    // If payment not paid, redirect to a failure page
    res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=payment_not_completed`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed?error=server_error`);
  }
};
