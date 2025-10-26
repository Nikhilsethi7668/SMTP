import { Request, Response } from 'express';
import crypto from 'crypto';
import { Types } from 'mongoose';
import UsersEmail from '../models/usersEmailModel.js';


const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Add a new email for user
export const addUserEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { email, isPrimary = false } = req.body;

    // Check if email already exists
    const existingEmail = await UsersEmail.findOne({ email });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: 'Email already exists in the system'
      });
      return;
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const userEmail = await UsersEmail.create({
      email,
      user: userId,
      isPrimary,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    // TODO: Send verification email here
    console.log(`Verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      data: {
        id: userEmail._id,
        email: userEmail.email,
        isPrimary: userEmail.isPrimary,
        isVerified: userEmail.isVerified
      }
    });
  } catch (error: any) {
    console.error('Error adding user email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add email',
      error: error.message
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const userEmail = await UsersEmail.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!userEmail) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
      return;
    }

    userEmail.isVerified = true;
    userEmail.verifiedAt = new Date();
    userEmail.verificationToken = undefined;
    userEmail.verificationTokenExpires = undefined;
    await userEmail.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: userEmail.email,
        isVerified: userEmail.isVerified
      }
    });
  } catch (error: any) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

// Set primary email
export const setPrimaryEmail = async (req:Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    const userEmail = await UsersEmail.findOneAndUpdate(
      { _id: emailId, user: userId },
      { isPrimary: true },
      { new: true }
    );

    if (!userEmail) {
      res.status(404).json({
        success: false,
        message: 'Email not found or you do not have permission'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Primary email updated successfully',
      data: {
        id: userEmail._id,
        email: userEmail.email,
        isPrimary: userEmail.isPrimary
      }
    });
  } catch (error: any) {
    console.error('Error setting primary email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary email',
      error: error.message
    });
  }
};

// Get user's emails
export const getUserEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    const emails = await UsersEmail.find({ user: userId })
      .select('-verificationToken -verificationTokenExpires -__v')
      .sort({ isPrimary: -1, email: 1 });

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails
    });
  } catch (error: any) {
    console.error('Error fetching user emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message
    });
  }
};

// Delete user email
export const deleteUserEmail = async (req:Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    const email = await UsersEmail.findOneAndDelete({
      _id: emailId,
      user: userId,
      isPrimary: false // Prevent deleting primary email
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found, already deleted, or cannot delete primary email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email deleted successfully',
      data: { id: email._id, email: email.email }
    });
  } catch (error: any) {
    console.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: error.message
    });
  }
};

// Resend verification email
export const resendVerification = async (req:Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const userEmail = await UsersEmail.findOneAndUpdate(
      { _id: emailId, user: userId, isVerified: false },
      {
        verificationToken,
        verificationTokenExpires
      },
      { new: true }
    );

    if (!userEmail) {
      return res.status(404).json({
        success: false,
        message: 'Email not found or already verified'
      });
    }

    // TODO: Send verification email here
    console.log(`New verification token for ${userEmail.email}: ${verificationToken}`);

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully',
      data: {
        id: userEmail._id,
        email: userEmail.email
      }
    });
  } catch (error: any) {
    console.error('Error resending verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};
