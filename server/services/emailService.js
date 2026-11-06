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
 * Send 2FA verification email with multipart text/plain + text/html
 * Optimized for high inbox deliverability and spam filter compliance
 */
export const sendOtpEmail = async ({ to, name, otp, purpose = 'login' }) => {
  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER || 'resqlanka@gmail.com';
  const safeName = escapeHtml(name || 'User');
  const safeOtp = escapeHtml(otp);

  const isRegistration = purpose === 'register';
  const subject = isRegistration
    ? `Your ResQ-Lanka verification code is ${otp}`
    : `Your ResQ-Lanka login verification code is ${otp}`;

  // Highlighted console print for development / evaluation
  console.log('\n=============================================================');
  console.log(`🚨 [ResQ-Lanka Security Service] ${isRegistration ? 'REGISTRATION' : 'LOGIN'} OTP GENERATED`);
  console.log(`📤 Sender      : ${senderEmail}`);
  console.log(`👤 Recipient   : ${safeName} <${to}>`);
  console.log(`🔑 6-Digit OTP : ${otp}`);
  console.log('⏳ Validity    : 10 minutes');
  console.log('=============================================================\n');

  if (!transporter) {
    // In dev mode without configured SMTP, the terminal output is our live channel
    return { success: true, simulated: true, otp };
  }

  // Plaintext alternative (crucial to prevent spam filtering)
  const plainText = `Hello ${name || 'User'},

Your 6-digit ResQ-Lanka verification code is: ${otp}

This verification code is valid for 10 minutes. Please enter this code on the verification screen to activate your account.

Security note: Never share this security code with anyone. ResQ-Lanka staff will never ask for your code. If you did not make this request, you can safely disregard this email.

---
ResQ-Lanka Disaster Management Network
Sri Lanka National Emergency Lines: 117 (DMC) | 1990 (Ambulance) | 119 (Police)
Web: https://resq-lanka.vercel.app`;

  const mailOptions = {
    from: `"ResQ-Lanka" <${senderEmail}>`,
    replyTo: senderEmail,
    to,
    subject,
    text: plainText,
    headers: {
      'X-Entity-Ref-ID': `${Date.now()}-${otp}`,
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
    },
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 28px; background-color: #0f172a; text-align: center;">
              <span style="display: inline-block; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                ResQ-Lanka
              </span>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">
                Disaster Coordination &amp; Civilian Relief Network
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px 24px 28px;">
              <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
                Account Verification Code
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                Hello <strong>${safeName}</strong>,
              </p>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Please use the following 6-digit code to verify your ResQ-Lanka account:
              </p>

              <!-- OTP Code Display Card -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 20px auto 24px auto;">
                <tr>
                  <td align="center" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 32px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                      ${safeOtp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="text-align: center; color: #64748b; font-size: 12px; margin: 0 0 24px 0;">
                This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 0 0 20px 0;">
                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                  <strong>Security Note:</strong> ResQ-Lanka will never call or message you asking for your verification code. If you did not initiate this request, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                National Emergency Hotlines: <strong>117</strong> (DMC) &bull; <strong>1990</strong> (Ambulance) &bull; <strong>119</strong> (Police)
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                ResQ-Lanka &bull; National Disaster Management Portal &bull; Sri Lanka
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
 * Includes both plaintext and modern clean HTML
 */
export const sendWelcomeEmail = async ({ to, name, role = 'citizen' }) => {
  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER || 'resqlanka@gmail.com';
  const safeName = escapeHtml(name || 'Member');
  const safeRole = escapeHtml(role.toUpperCase());

  console.log(`📢 [ResQ-Lanka Security Service] Registration welcome email queued for: ${safeName} <${to}> (${safeRole})`);

  if (!transporter) {
    return { success: true, simulated: true };
  }

  const subject = 'Welcome to ResQ-Lanka - Account Activated';

  const plainText = `Welcome to ResQ-Lanka, ${name || 'Member'}!

Your account has been successfully verified and activated as a ${safeRole}.

Key features available to you:
- Emergency SOS: Submit crisis incident reports with GPS coordinates
- Safe Shelters: Locate safe relief centers with capacity tracking
- Relief Supplies: View critical shortages and pledge essential items
- Community Tasks: Participate in volunteer relief efforts

National Emergency Hotlines:
- Disaster Management Center (DMC): 117
- Suwa Seriya Ambulance: 1990
- Police Emergency: 119

Visit portal: https://resq-lanka.vercel.app

Thank you,
ResQ-Lanka Operations Team`;

  const mailOptions = {
    from: `"ResQ-Lanka" <${senderEmail}>`,
    replyTo: senderEmail,
    to,
    subject,
    text: plainText,
    headers: {
      'X-Entity-Ref-ID': `${Date.now()}-welcome`,
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
    },
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 28px; background-color: #0f172a; text-align: center;">
              <span style="display: inline-block; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                ResQ-Lanka
              </span>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">
                Disaster Coordination &amp; Civilian Relief Network
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px 24px 28px;">
              <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">
                Welcome, ${safeName}!
              </h1>
              <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-bottom: 16px;">
                Role: ${safeRole}
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                Your account has been successfully verified and activated on the ResQ-Lanka platform.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; font-weight: 700;">Platform Features:</h2>
                <ul style="margin: 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.8;">
                  <li><strong>Emergency SOS:</strong> Report incidents with GPS landmarks.</li>
                  <li><strong>Safe Shelters:</strong> View live occupancy across designated relief centers.</li>
                  <li><strong>Relief Supplies:</strong> View high-priority deficits and register supply pledges.</li>
                  <li><strong>Community Tasks:</strong> Assist in supervised non-hazardous relief operations.</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 24px 0 12px 0;">
                <a href="https://resq-lanka.vercel.app" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                  Go to ResQ-Lanka Portal
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                National Emergency Hotlines: <strong>117</strong> (DMC) &bull; <strong>1990</strong> (Ambulance) &bull; <strong>119</strong> (Police)
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                ResQ-Lanka &bull; National Disaster Management Portal &bull; Sri Lanka
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
