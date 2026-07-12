const crypto = require('crypto');
const { Resend } = require('resend');

const createVerificationToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const buildVerificationEmailHtml = ({ name, verificationUrl, expiresInMinutes = 15 }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your TaskFlow account</title>
  </head>
  <body style="margin:0;padding:0;background:#07070d;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f7ff;">
    <div style="max-width:640px;margin:32px auto;background:linear-gradient(135deg,#11131d 0%,#17192b 100%);border:1px solid #2a2d3f;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
      <div style="padding:32px 32px 16px;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;background:rgba(139,92,246,0.14);color:#c4b5fd;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
          <span style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;display:inline-block;"></span>
          TaskFlow • Email Verification
        </div>
        <h1 style="margin:20px 0 10px;font-size:28px;line-height:1.2;color:#ffffff;">Verify your email address</h1>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#cbd5e1;">Hi ${name || 'there'}, welcome to TaskFlow. Please confirm your email to activate your account and start organizing your work.</p>
      </div>
      <div style="padding:0 32px 32px;">
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px;">
          <p style="margin:0 0 16px;font-size:14px;color:#cbd5e1;">Click the button below to verify your email. This link will expire in ${expiresInMinutes} minutes.</p>
          <a href="${verificationUrl}" style="display:inline-block;background:linear-gradient(90deg,#8b5cf6 0%,#6366f1 100%);color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">Verify Email</a>
        </div>
        <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">If the button does not work, copy and open this link manually:</p>
        <p style="margin:6px 0 0;word-break:break-all;font-size:13px;color:#c4b5fd;">${verificationUrl}</p>
      </div>
      <div style="padding:16px 32px 28px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#64748b;">
        <p style="margin:0;">This email was sent by TaskFlow. If you didn’t create an account, you can safely ignore it.</p>
      </div>
    </div>
  </body>
</html>
`;

const sendVerificationEmail = async ({ to, name, token }) => {
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const verificationUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

  if (!resend) {
    throw new Error('Email service is not configured');
  }

  const from = process.env.EMAIL_FROM || 'TaskFlow <onboarding@resend.dev>';
  const response = await resend.emails.send({
    from,
    to: [to],
    subject: 'Verify your TaskFlow account',
    html: buildVerificationEmailHtml({ name, verificationUrl }),
  });

  return { success: true, data: response };
};

module.exports = {
  createVerificationToken,
  hashToken,
  sendVerificationEmail,
};
