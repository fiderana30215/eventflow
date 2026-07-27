import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server | null = null;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-event", (eventId: string) => {
      socket.join(`event-${eventId}`);
    });
    socket.on("leave-event", (eventId: string) => {
      socket.leave(`event-${eventId}`);
    });
  });

  return io;
}

export function emitTicketsUpdate(eventId: number, categoryId: number, quantitySold: number, quantityTotal: number) {
  if (!io) return;
  io.to(`event-${eventId}`).emit("tickets-update", {
    categoryId,
    quantitySold,
    quantityTotal,
    remaining: quantityTotal - quantitySold,
  });
}