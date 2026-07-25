import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const emailQueue = new Queue("emailQueue", { connection });

export async function enqueueTicketEmail(data: {
  to: string;
  fullName: string;
  eventTitle: string;
  qrPayload: string;
}) {
  await emailQueue.add("send-ticket-email", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}