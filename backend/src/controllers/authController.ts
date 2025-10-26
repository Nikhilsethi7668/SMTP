import { hasActiveOtp, verifyOtpService } from "../services/otpService.js";
import { sendOtpEmail } from "../services/otpEmailService.js";
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// import functional user service functions
import {
  createOrgAndAdmin,
  isUserVerified,
  validatePassword,
  updateRefreshToken,
  markUserAsVerified,
} from "../services/userService.js";

config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: any) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const saveRefreshToken = async (email: any, refreshToken: any) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  return updateRefreshToken(email, refreshToken, expiresAt);
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const verified = await isUserVerified(email);
    if (!verified) {
      return res.status(401).json({
        success: false,
        message: "Email is not verified",
      });
    }

    const user = await validatePassword(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    await saveRefreshToken(email, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Remove sensitive data before sending response
    const { password_hash, refresh_token, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log in",
    });
  }
};

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, username, fullName, companyName } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    console.log("User signup initiated:", { email, username, fullName, companyName });

    const user = await createOrgAndAdmin(companyName, fullName, username, password, email);
    await sendOtpEmail(email, "registration", username);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Error logging out:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log out",
    });
  }
};

/**
 * @description Send OTP to user's email
 * @route POST /api/otp/send
 */
export const sendOtp = async (req: any, res: any) => {
  try {
    const { email, purpose, userName } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email and purpose are required",
      });
    }

    if (purpose === "registration") {
      const verified = await isUserVerified(email);
      if (verified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified",
        });
      }
    }

    const hasOtp = await hasActiveOtp(email, purpose);
    if (hasOtp) {
      return res.status(429).json({
        success: false,
        message: "An active OTP already exists. Please wait before requesting a new one.",
      });
    }

    const result = await sendOtpEmail(email, purpose, userName);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

/**
 * @description Verify OTP
 * @route POST /api/otp/verify
 */
export const verifyOtp = async (req: any, res: any) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and purpose are required",
      });
    }

    const { isValid, message } = await verifyOtpService(email, otp, purpose);

    if (!isValid) {
      // OTP invalid
      return res.status(400).json({
        success: false,
        message: message || "Invalid or expired OTP",
      });
    }

    // OTP valid — mark user as verified
    const user = await markUserAsVerified(email);
    if (user) {
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    }

    // If markUserAsVerified failed for some reason
    return res.status(500).json({
      success: false,
      message: "OTP verified but failed to update user verification status",
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
};

/**
 * @description Resend OTP
 * @route POST /api/otp/resend
 */
export const resendOtp = async (req: any, res: any) => {
  try {
    const { email, purpose, userName } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email and purpose are required",
      });
    }

    const result = await sendOtpEmail(email, purpose, userName);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP",
    });
  }
};
