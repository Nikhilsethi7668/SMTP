import nodemailer from 'nodemailer';

// Create nodemailer transporter with provided credentials
const transporter = nodemailer.createTransport({
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
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.from - Sender email address
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} [options.html] - Email HTML content
 * @returns {Promise<Object>} - Email sending result
 */
export const sendEmail = async ({ from, to, subject, text, html }) => {
  try {
    if (!from || !to || !subject || !text) {
      throw new Error('Email from, to, subject, and text are required');
    }
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
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

export default { sendEmail, verifyTransporter };

