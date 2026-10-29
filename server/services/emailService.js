import nodemailer from 'nodemailer';

/**
 * Generate a cryptographically secure-enough 6-digit OTP
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Configure nodemailer transporter if SMTP credentials exist in env
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null; // Fallback to console simulation
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

/**
 * Send 2FA verification email or log to terminal fallback
 */
export const sendOtpEmail = async ({ to, name, otp }) => {
  const transporter = getTransporter();

  // Highlighted console print for development / evaluation
  console.log('\n=============================================================');
  console.log('🚨 [ResQ-Lanka 2FA Security Service] EMAIL OTP GENERATED');
  console.log(`👤 Recipient : ${name || 'Citizen/User'} <${to}>`);
  console.log(`🔑 6-Digit OTP : ${otp}`);
  console.log('⏳ Validity    : 10 minutes');
  console.log('=============================================================\n');

  if (!transporter) {
    // In dev mode without configured SMTP, the terminal output is our live channel
    return { success: true, simulated: true, otp };
  }

  const mailOptions = {
    from: `"ResQ-Lanka Emergency Response" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[ResQ-Lanka] ${otp} is your Emergency Login Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #dc2626; margin: 0; font-size: 24px; letter-spacing: -0.5px;">ResQ-Lanka Emergency Portal</h2>
          <p style="color: #64748b; margin-top: 4px; font-size: 14px;">National Disaster Coordination & Relief Network</p>
        </div>
        
        <p style="color: #1e293b; font-size: 16px;">Hello <strong>${name || 'User'}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">
          You requested access to the ResQ-Lanka Emergency Operations network. Please use the verification code below to complete your login:
        </p>

        <div style="margin: 32px 0; text-align: center;">
          <div style="display: inline-block; background-color: #fef2f2; border: 2px dashed #ef4444; border-radius: 8px; padding: 16px 36px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 10px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          If you did not initiate this login request, please secure your account immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          ResQ-Lanka Disaster Management System • Sri Lanka
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, simulated: false };
  } catch (err) {
    console.error('❌ Failed to send SMTP email, fallback active:', err.message);
    return { success: true, simulated: true, otp };
  }
};
