import sgMail from '@sendgrid/mail';
import { generateOtp } from './otpService.js';

// Initialize SendGrid with API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Send OTP email to the user
 * @param {string} email - Recipient email address
 * @param {string} purpose - Purpose of the OTP (e.g., 'registration', 'password_reset')
 * @param {string} userName - Optional user's name for personalization
 * @returns {Promise<Object>} Result of the operation
 */
export const sendOtpEmail = async (email: string, purpose: string, userName: string = 'User') => {
  try {
    // Generate OTP
    const { otp, expiresAt } = await generateOtp(email, purpose);
    
    // Email subject based on purpose
//     const getSubject = () => {
//       switch (purpose) {
//         case 'registration':
//           return 'Verify Your Email Address';
//         case 'password_reset':
//           return 'Password Reset OTP';
//         case '2fa':
//           return 'Your Two-Factor Authentication Code';
//         default:
//           return 'Your One-Time Password (OTP)';
//       }
//     };

//     // Email template
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background-color: #4f46e5; padding: 20px; color: white; text-align: center;">
//           <h1>${getSubject()}</h1>
//         </div>
//         <div style="padding: 20px; background-color: #f9fafb;">
//           <p>Hello ${userName},</p>
//           <p>Your one-time verification code is:</p>
//           <div style="text-align: center; margin: 30px 0;">
//             <div style="
//               display: inline-block; 
//               padding: 15px 30px; 
//               background-color: #eef2ff; 
//               color: #4f46e5; 
//               font-size: 24px; 
//               font-weight: bold;
//               letter-spacing: 5px;
//               border-radius: 5px;
//             ">
//               ${otp}
//             </div>
//           </div>
//           <p>This code will expire at ${new Date(expiresAt).toLocaleString()}.</p>
//           <p>If you didn't request this code, please ignore this email.</p>
//           <p>Best regards,<br>Your Application Team</p>
//         </div>
//         <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
//           <p> ${new Date().getFullYear()} Your Application. All rights reserved.</p>
//         </div>
//       </div>
//     `;

//     // Plain text version
//     const text = `
// ${getSubject()}

// Hello ${userName},

// Your one-time verification code is: ${otp}

// This code will expire at ${new Date(expiresAt).toLocaleString()}.

// If you didn't request this code, please ignore this email.

// Best regards,
// Your Application Team
//     `;

//     // Send email
//     const msg = {
//       to: email,
//       from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
//       subject: getSubject(),
//       text: text,
//       html: html,
//     };

//     await sgMail.send(msg);
    
console.log("otp",otp)
    return { 
      success: true, 
      message: 'OTP sent successfully',
      expiresAt: expiresAt
    };
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Resend OTP email
 * @param {string} email - Recipient email address
 * @param {string} purpose - Purpose of the OTP
 * @param {string} userName - Optional user's name
 * @returns {Promise<Object>} Result of the operation
 */
export const resendOtpEmail = async (email: string, purpose: string, userName: string = 'User') => {
  return sendOtpEmail(email, purpose, userName);
};

