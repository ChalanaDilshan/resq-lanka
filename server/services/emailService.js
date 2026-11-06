import nodemailer from 'nodemailer';
import crypto from 'crypto';

/**
 * Escape raw strings to prevent HTML template injection in emails
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Generate a cryptographically secure 6-digit OTP using CSPRNG
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Configure nodemailer transporter for Gmail (resqlanka@gmail.com)
 * or custom SMTP server if SMTP_HOST is explicitly defined in env.
 */
export const getTransporter = () => {
  const user = process.env.EMAIL_USER || 'resqlanka@gmail.com';
  const pass = process.env.EMAIL_PASS;

  // If no password configured (e.g. local dev without SMTP), fall back to terminal simulation
  if (!pass) {
    return null;
  }

  // Custom SMTP server configuration if provided
  if (process.env.SMTP_HOST) {
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Primary Gmail service configuration for resqlanka@gmail.com
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/**
 * Send 2FA verification email or log to terminal fallback
 * Dispatches from resqlanka@gmail.com with secure CSPRNG OTP
 */
export const sendOtpEmail = async ({ to, name, otp, purpose = 'login' }) => {
  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER || 'resqlanka@gmail.com';
  const safeName = escapeHtml(name || 'User');
  const safeOtp = escapeHtml(otp);

  const isRegistration = purpose === 'register';
  const subjectAction = isRegistration ? 'Registration' : 'Emergency Login';

  // Highlighted console print for development / evaluation
  console.log('\n=============================================================');
  console.log(`🚨 [ResQ-Lanka Security Service] ${subjectAction.toUpperCase()} OTP GENERATED`);
  console.log(`📤 Sender      : ${senderEmail}`);
  console.log(`👤 Recipient   : ${safeName} <${to}>`);
  console.log(`🔑 6-Digit OTP : ${otp}`);
  console.log('⏳ Validity    : 10 minutes');
  console.log('=============================================================\n');

  if (!transporter) {
    // In dev mode without configured SMTP, the terminal output is our live channel
    return { success: true, simulated: true, otp };
  }

  const mailOptions = {
    from: `"ResQ-Lanka Emergency Operations" <${senderEmail}>`,
    to,
    subject: `[ResQ-Lanka] ${safeOtp} is your ${subjectAction} Verification Code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            ResQ-Lanka Emergency Operations
          </div>
          <h2 style="color: #0f172a; margin: 14px 0 4px 0; font-size: 22px; font-weight: 700;">${subjectAction} Verification Code</h2>
          <p style="color: #64748b; margin: 0; font-size: 13px;">National Disaster Coordination &amp; Relief Network • Sri Lanka</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 12px;">Hello <strong>${safeName}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0;">
          A request was initiated on the ResQ-Lanka emergency portal to authenticate access to your account. Please use the 6-digit security code below to complete your verification:
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 10px; padding: 18px 40px;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace;">${safeOtp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 10px; font-weight: 500;">
            ⏳ This code expires in <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.5;">
            <strong>Security Notice:</strong> ResQ-Lanka emergency staff will never ask for your verification code by phone, SMS, or chat. If you did not make this request, you can safely ignore this email.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <div style="text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
            National Disaster Helpline: <span style="color: #dc2626;">117 (DMC)</span> • Ambulance: <span style="color: #0284c7;">1990</span> • Police: <span style="color: #0284c7;">119</span>
          </p>
          <p style="margin: 0;">
            Sent by <strong>resqlanka@gmail.com</strong> • ResQ-Lanka Disaster Management System
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email successfully delivered via Gmail to ${to} (MessageId: ${info.messageId})`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to dispatch SMTP email via Gmail, terminal fallback active:', err.message);
    return { success: true, simulated: true, otp, error: err.message };
  }
};

/**
 * Send official account registration welcome email from resqlanka@gmail.com
 */
export const sendWelcomeEmail = async ({ to, name, role = 'citizen' }) => {
  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER || 'resqlanka@gmail.com';
  const safeName = escapeHtml(name || 'ResQ-Lanka Member');
  const safeRole = escapeHtml(role.toUpperCase());

  console.log(`📢 [ResQ-Lanka Security Service] Registration welcome email queued for: ${safeName} <${to}> (${safeRole})`);

  if (!transporter) {
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"ResQ-Lanka Emergency Operations" <${senderEmail}>`,
    to,
    subject: `[ResQ-Lanka] Welcome to the National Emergency Coordination Network`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            ResQ-Lanka National Disaster Platform
          </div>
          <h2 style="color: #0f172a; margin: 14px 0 4px 0; font-size: 22px; font-weight: 700;">Welcome, ${safeName}!</h2>
          <p style="color: #64748b; margin: 0; font-size: 13px;">Registered Account Role: <strong>${safeRole}</strong></p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Your account has been successfully registered with the ResQ-Lanka Disaster Management and Civilian Relief Coordination Network.
        </p>

        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Key Platform Features:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
            <li><strong>Emergency SOS:</strong> Report real-time crisis incidents with GPS coordinates.</li>
            <li><strong>Safe Shelters:</strong> Locate active relief evacuation shelters with capacity tracking.</li>
            <li><strong>Relief Supplies:</strong> View high-priority shortages and pledge essential relief items.</li>
            <li><strong>Community Tasks:</strong> Engage in verified, supervised volunteer relief operations.</li>
          </ul>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
          Every time you log in to ResQ-Lanka from a new session, a two-factor verification code (OTP) will be dispatched directly to your registered email address from <strong>resqlanka@gmail.com</strong>.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <div style="text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
            National Emergency Contacts: <span style="color: #dc2626;">117 (DMC)</span> • <span style="color: #0284c7;">1990 (Ambulance)</span> • <span style="color: #0284c7;">119 (Police)</span>
          </p>
          <p style="margin: 0;">
            ResQ-Lanka Disaster Coordination Network • Democratic Socialist Republic of Sri Lanka
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email dispatched via Gmail to ${to} (MessageId: ${info.messageId})`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to dispatch welcome email via Gmail:', err.message);
    return { success: true, simulated: true, error: err.message };
  }
};
