import mongoose from "mongoose";
import { Credit } from "../models/creditModel.js";

// Create credit record for new user
export const createCredit = async (
  user_id: mongoose.Types.ObjectId,
  email_credits = 0,
  verification_credits = 0
) => {
  const credit = new Credit({
    user_id,
    email_credits,
    verification_credits,
  });
  await credit.save();
  return credit.toObject();
};

// Get user credits
export const getCreditByUserId = async (user_id: mongoose.Types.ObjectId) => {
  return await Credit.findOne({ user_id }).lean();
};

// Get or create credit record (useful for ensuring credit exists)
export const getOrCreateCredit = async (user_id: mongoose.Types.ObjectId) => {
  let credit = await Credit.findOne({ user_id }).lean();
  
  if (!credit) {
    // Create default credit record with signup bonus (600 credits as mentioned in UI)
    credit = await createCredit(user_id, 300, 300); // Split signup bonus 50/50
  }
  
  return credit;
};

// Add credits to user
export const addCredits = async (
  user_id: mongoose.Types.ObjectId,
  email_credits: number = 0,
  verification_credits: number = 0
) => {
  const credit = await Credit.findOne({ user_id });
  
  if (!credit) {
    // If credit doesn't exist, create it
    return await createCredit(user_id, email_credits, verification_credits);
  }
  
  credit.email_credits += email_credits;
  credit.verification_credits += verification_credits;
  await credit.save();
  
  return credit.toObject();
};

// Deduct email credits
export const deductEmailCredits = async (
  user_id: mongoose.Types.ObjectId,
  amount: number
) => {
  const credit = await Credit.findOne({ user_id });
  
  if (!credit) {
    throw new Error("Credit record not found");
  }
  
  if (credit.email_credits < amount) {
    throw new Error("Insufficient email credits");
  }
  
  credit.email_credits -= amount;
  await credit.save();
  
  return credit.toObject();
};

// Deduct verification credits
export const deductVerificationCredits = async (
  user_id: mongoose.Types.ObjectId,
  amount: number
) => {
  const credit = await Credit.findOne({ user_id });
  
  if (!credit) {
    throw new Error("Credit record not found");
  }
  
  if (credit.verification_credits < amount) {
    throw new Error("Insufficient verification credits");
  }
  
  credit.verification_credits -= amount;
  await credit.save();
  
  return credit.toObject();
};

// Check if user has sufficient credits
export const hasSufficientCredits = async (
  user_id: mongoose.Types.ObjectId,
  email_credits_needed: number = 0,
  verification_credits_needed: number = 0
) => {
  const credit = await Credit.findOne({ user_id });
  
  if (!credit) {
    return false;
  }
  
  return (
    credit.email_credits >= email_credits_needed &&
    credit.verification_credits >= verification_credits_needed
  );
};

