import "server-only";
import nodemailer from "nodemailer";

type SendOtpParams = {
  to: string;
  otp: string;
};

const htmlTemplate = (otp: string) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>Your PathSathi login code</h2>
    <p>Use the code below to continue:</p>
    <div style="font-size:26px;font-weight:700;letter-spacing:4px">${otp}</div>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this, you can ignore this email.</p>
  </div>
`;

async function sendViaSmtp(to: string, otp: string) {
  const smtpKey = process.env.BREVO_SMTP_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "PathSathi";
  const replyTo = process.env.BREVO_REPLY_TO ?? senderEmail ?? "";

  if (!smtpKey || !senderEmail) {
    throw new Error("Missing Brevo SMTP configuration.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER ?? "apikey",
      pass: smtpKey
    }
  });

  await transporter.sendMail({
    from: `${senderName} <${senderEmail}>`,
    to,
    replyTo: replyTo || undefined,
    subject: `Your PathSathi login code: ${otp}`,
    html: htmlTemplate(otp)
  });
}

async function sendViaApi(to: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "PathSathi";
  const replyTo = process.env.BREVO_REPLY_TO ?? senderEmail ?? "";

  if (!apiKey || !senderEmail) {
    throw new Error("Missing Brevo API configuration.");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [{ email: to }],
      replyTo: replyTo ? { email: replyTo } : undefined,
      subject: `Your PathSathi login code: ${otp}`,
      htmlContent: htmlTemplate(otp)
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Brevo API send failed: ${errorText}`);
  }
}

export async function sendOtpEmail({ to, otp }: SendOtpParams) {
  if (process.env.BREVO_SMTP_KEY) {
    await sendViaSmtp(to, otp);
    return;
  }
  await sendViaApi(to, otp);
}


