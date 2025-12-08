import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import EmailAccount from '../models/EmailAccount.js';

// Default transporter for custom domains
const defaultTransporter = nodemailer.createTransport({
  host: '107.175.67.25',
  port: 2525,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: 'admin',
    pass: 'Nikhil1234$$',
  },
});

/**
 * Refresh Google OAuth access token
 */
async function refreshGoogleToken(emailAccount) {
  // Check if environment variables are set
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
  }

  if (!emailAccount.refreshToken) {
    throw new Error(`No refresh token available for ${emailAccount.email}. Please reconnect the account.`);
  }

  try {
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: emailAccount.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update the email account with new tokens
    emailAccount.accessToken = credentials.access_token;
    emailAccount.tokenExpiry = credentials.expiry_date 
      ? new Date(credentials.expiry_date) 
      : null;
    await emailAccount.save();

    return credentials.access_token;
  } catch (error) {
    console.error(`Error refreshing Google token for ${emailAccount.email}:`, error.message);
    throw new Error(`Failed to refresh Google OAuth token: ${error.message}`);
  }
}

/**
 * Refresh Microsoft OAuth access token
 */
async function refreshMicrosoftToken(emailAccount) {
  // Check if environment variables are set
  if (!process.env.OUTLOOK_CLIENT_ID || !process.env.OUTLOOK_CLIENT_SECRET) {
    throw new Error(
      'Microsoft OAuth credentials not configured. Please set OUTLOOK_CLIENT_ID and OUTLOOK_CLIENT_SECRET environment variables.'
    );
  }

  if (!emailAccount.refreshToken) {
    throw new Error(`No refresh token available for ${emailAccount.email}. Please reconnect the account.`);
  }

  const SCOPES = [
    'offline_access',
    'openid',
    'profile',
    'email',
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/Mail.ReadWrite',
    'https://graph.microsoft.com/SMTP.Send',
    'https://graph.microsoft.com/IMAP.AccessAsUser.All',
  ];

  const tokenParams = {
    grant_type: 'refresh_token',
    refresh_token: emailAccount.refreshToken,
    client_id: process.env.OUTLOOK_CLIENT_ID,
    client_secret: process.env.OUTLOOK_CLIENT_SECRET,
    scope: SCOPES.join(' '),
  };

  try {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMsg = errorData.error?.message || errorData.error_description || response.statusText;
      throw new Error(`Failed to refresh Microsoft token: ${errorMsg}`);
    }

    const data = await response.json();

    // Update the email account with new tokens
    emailAccount.accessToken = data.access_token;
    emailAccount.refreshToken = data.refresh_token || emailAccount.refreshToken;
    emailAccount.tokenExpiry = data.expires_in 
      ? new Date(Date.now() + data.expires_in * 1000)
      : null;
    await emailAccount.save();

    return data.access_token;
  } catch (error) {
    console.error(`Error refreshing Microsoft token for ${emailAccount.email}:`, error.message);
    throw new Error(`Failed to refresh Microsoft OAuth token: ${error.message}`);
  }
}

/**
 * Create transporter based on account type
 */
async function createTransporterForEmail(fromEmail, emailAccountId = null) {
  // If emailAccountId is provided, fetch account details
  if (emailAccountId) {
    const emailAccount = await EmailAccount.findById(emailAccountId);
    if (emailAccount) {
      return await createTransporterForAccount(emailAccount);
    }
  }

  // Try to find account by email
  const emailAccount = await EmailAccount.findOne({ email: fromEmail });
  if (emailAccount) {
    return await createTransporterForAccount(emailAccount);
  }

  // No account found - use default SMTP for custom domains
  console.log(`No OAuth account found for ${fromEmail}, using default SMTP`);
  return defaultTransporter;
}

/**
 * Create transporter for specific account
 */
async function createTransporterForAccount(emailAccount) {
  // Google account - use OAuth2 with Gmail SMTP
  if (emailAccount.provider === 'gmail') {
    if (!emailAccount.accessToken && !emailAccount.refreshToken) {
      console.warn(`⚠️ Google account ${emailAccount.email} has no OAuth tokens. Falling back to default SMTP.`);
      return defaultTransporter;
    }

    // Check if OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn(`⚠️ Google OAuth not configured. Falling back to default SMTP for ${emailAccount.email}.`);
      return defaultTransporter;
    }

    try {
      // Refresh token if expired
      let accessToken = emailAccount.accessToken;
      if (!accessToken || (emailAccount.tokenExpiry && new Date() >= new Date(emailAccount.tokenExpiry))) {
        console.log(`🔄 Google access token expired for ${emailAccount.email}, refreshing...`);
        try {
          accessToken = await refreshGoogleToken(emailAccount);
          console.log(`✅ Google token refreshed successfully`);
        } catch (refreshError) {
          console.error(`❌ Failed to refresh Google token: ${refreshError.message}`);
          console.warn(`⚠️ Falling back to default SMTP for ${emailAccount.email}`);
          return defaultTransporter;
        }
      }

      const { google } = await import('googleapis');
      
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailAccount.email,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: emailAccount.refreshToken,
          accessToken: accessToken,
        },
      });
    } catch (error) {
      console.error(`❌ Error creating Google OAuth transporter for ${emailAccount.email}:`, error.message);
      console.warn(`⚠️ Falling back to default SMTP`);
      return defaultTransporter;
    }
  }

  // Microsoft account - use OAuth2 with Office365 SMTP
  if (emailAccount.provider === 'outlook') {
    if (!emailAccount.accessToken && !emailAccount.refreshToken) {
      console.warn(`⚠️ Microsoft account ${emailAccount.email} has no OAuth tokens. Falling back to default SMTP.`);
      return defaultTransporter;
    }

    // Check if OAuth credentials are configured
    if (!process.env.OUTLOOK_CLIENT_ID || !process.env.OUTLOOK_CLIENT_SECRET) {
      console.warn(`⚠️ Microsoft OAuth not configured. Falling back to default SMTP for ${emailAccount.email}.`);
      return defaultTransporter;
    }

    try {
      // Refresh token if expired
      let accessToken = emailAccount.accessToken;
      if (!accessToken || (emailAccount.tokenExpiry && new Date() >= new Date(emailAccount.tokenExpiry))) {
        console.log(`🔄 Microsoft access token expired for ${emailAccount.email}, refreshing...`);
        try {
          accessToken = await refreshMicrosoftToken(emailAccount);
          console.log(`✅ Microsoft token refreshed successfully`);
        } catch (refreshError) {
          console.error(`❌ Failed to refresh Microsoft token: ${refreshError.message}`);
          console.warn(`⚠️ Falling back to default SMTP for ${emailAccount.email}`);
          return defaultTransporter;
        }
      }

      return nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
          type: 'OAuth2',
          user: emailAccount.email,
          clientId: process.env.OUTLOOK_CLIENT_ID,
          clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
          refreshToken: emailAccount.refreshToken,
          accessToken: accessToken,
        },
      });
    } catch (error) {
      console.error(`❌ Error creating Microsoft OAuth transporter for ${emailAccount.email}:`, error.message);
      console.warn(`⚠️ Falling back to default SMTP`);
      return defaultTransporter;
    }
  }

  // Custom domain - use account's SMTP settings or default
  if (emailAccount.smtp?.host && emailAccount.smtp?.user && emailAccount.smtp?.pass) {
    return nodemailer.createTransport({
      host: emailAccount.smtp.host,
      port: emailAccount.smtp.port || 587,
      secure: emailAccount.smtp.secure || false,
      auth: {
        user: emailAccount.smtp.user,
        pass: emailAccount.smtp.pass,
      },
    });
  }

  // Fallback to default SMTP
  return defaultTransporter;
}

/**
 * Send email using nodemailer
 * Automatically detects if email is from Google/Microsoft and uses OAuth
 * @param {Object} options - Email options
 * @param {string} options.from - Sender email address
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} [options.html] - Email HTML content
 * @param {string} [options.emailAccountId] - Optional email account ID
 * @returns {Promise<Object>} - Email sending result
 */
export const sendEmail = async ({ from, to, subject, text, html, emailAccountId }) => {
  try {
    if (!from || !to || !subject || !text) {
      throw new Error('Email from, to, subject, and text are required');
    }

    // Create appropriate transporter based on account type
    const transporter = await createTransporterForEmail(from, emailAccountId);

    const info = await transporter.sendMail({
      from: from,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Verify transporter connection
 * @returns {Promise<boolean>}
 */
export const verifyTransporter = async () => {
  try {
    await defaultTransporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

export default { sendEmail, verifyTransporter };

