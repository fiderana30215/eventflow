import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { sendEmail, ticketEmailTemplate } from "../services/email.service";
import { generateQrCodeDataUrl } from "../services/qrcode.service";

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    if (job.name === "send-ticket-email") {
      const { to, fullName, eventTitle, qrPayload } = job.data;
      const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);
      await sendEmail({
        to,
        subject: `Votre billet — ${eventTitle}`,
        html: ticketEmailTemplate(fullName, eventTitle, qrCodeDataUrl),
      });
    }
  },
  { connection }
);

emailWorker.on("completed", (job) => console.log(`Email envoyé: job ${job.id}`));
emailWorker.on("failed", (job, err) => console.error(`Échec email job ${job?.id}:`, err.message));