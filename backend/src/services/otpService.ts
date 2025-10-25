import { Otp, IOtp } from '../models/otpModel.js';

/** ✅ Generate a new OTP */
export const generateOtp = async (email: string, purpose: string, expiryMinutes = 15) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Delete existing OTPs for the same email & purpose
  await Otp.deleteMany({ email, purpose });

  // Create a new one
  const newOtp = await Otp.create({
    email,
    otp,
    purpose,
    expires_at: expiresAt,
  });

  return {
    id: newOtp._id,
    otp: newOtp.otp,
    expiresAt: newOtp.expires_at,
  };
};

/** ✅ Verify & consume an OTP */
export const verifyOtpService = async (email: string, otp: string, purpose: string) => {
  const existingOtp = await Otp.findOne({ email, otp, purpose });

  if (!existingOtp) {
    return { isValid: false, message: 'Invalid or expired OTP' };
  }

  if (existingOtp.expires_at < new Date()) {
    await Otp.deleteOne({ _id: existingOtp._id });
    return { isValid: false, message: 'OTP expired' };
  }

  // OTP is valid → consume it (single use)
  await Otp.deleteOne({ _id: existingOtp._id });

  return { 
    isValid: true, 
    message: 'OTP verified successfully',
    otpRecord: existingOtp,
  };
};

/** ✅ Check if an active OTP exists */
export const hasActiveOtp = async (email: string, purpose: string): Promise<boolean> => {
  const now = new Date();
  const otp = await Otp.findOne({ email, purpose, expires_at: { $gt: now } });
  return !!otp;
};

/** ✅ Clean up expired OTPs (for scheduled jobs) */
export const cleanupExpiredOtps = async (): Promise<void> => {
  await Otp.deleteMany({ expires_at: { $lte: new Date() } });
};
