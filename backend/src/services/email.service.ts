import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  await transporter.sendMail({
    from: '"EventFlow" <no-reply@eventflow.com>',
    to,
    subject,
    html,
  });
}

export function ticketEmailTemplate(fullName: string, eventTitle: string, qrCodeDataUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
      <h2>Votre billet pour ${eventTitle}</h2>
      <p>Bonjour ${fullName},</p>
      <p>Voici votre billet. Présentez ce QR code à l'entrée.</p>
      <img src="${qrCodeDataUrl}" alt="QR Code" style="width:200px;height:200px;" />
      <p>Merci et à bientôt !</p>
    </div>
  `;
}