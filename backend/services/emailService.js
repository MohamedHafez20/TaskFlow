const crypto = require("crypto");
const { Resend } = require("resend");

const createVerificationCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const buildVerificationEmailHtml = ({ name, code, expiresInMinutes = 10 }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your TaskFlow email</title>
  </head>
  <body style="margin:0;padding:0;background:#07070d;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f7ff;">
    <div style="max-width:640px;margin:32px auto;background:linear-gradient(135deg,#11131d 0%,#17192b 100%);border:1px solid #2a2d3f;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
      <div style="padding:32px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:16px;background:#7c3aed;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;">TF</div>
          <div>
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#a78bfa;">TaskFlow</p>
            <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;color:#ffffff;">Verify your email</h1>
          </div>
        </div>

        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1;">Hi ${name || 'there'}, enter the code below in TaskFlow to verify your account. This code expires in ${expiresInMinutes} minutes.</p>

        <div style="margin:0 auto 24px;max-width:280px;padding:28px 24px;border-radius:24px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);text-align:center;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#c4b5fd;">Your verification code</p>
          <p style="margin:0;font-size:40px;letter-spacing:10px;font-weight:900;color:#ffffff;">${code}</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;color:#cbd5e1;">If you didn’t create this account, you can safely ignore this email. This code expires in ${expiresInMinutes} minutes.</p>
      </div>
      <div style="padding:24px 32px 28px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#64748b;">
        <p style="margin:0;">TaskFlow • Build focus, stay productive.</p>
      </div>
    </div>
  </body>
</html>
`;

const sendVerificationEmail = async ({ to, name, code }) => {
  try {
    console.log("========== RESEND ==========");
    console.log("To:", to);
    console.log("From:", process.env.EMAIL_FROM);
    console.log("API Exists:", !!process.env.RESEND_API_KEY);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TaskFlow <onboarding@resend.dev>",
      to,
      subject: "Your TaskFlow verification code",
      html: buildVerificationEmailHtml({ name, code }),
    });

    console.log("✅ Resend Response:");
    console.dir(response, { depth: null });

    return response;
  } catch (err) {
    console.error("❌ RESEND ERROR");
    console.error(err);
    throw err;
  }
};

module.exports = {
  createVerificationCode,
  hashToken,
  sendVerificationEmail,
};