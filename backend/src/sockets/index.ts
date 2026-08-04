import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

interface SocketUser {
  id: string;
  role: string;
  clinicId: string | null;
}

let io: SocketIOServer;

function initSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean),
      credentials: true,
    },
  });

  // socket handshake has no header the way HTTP does — the client sends
  // the access token as auth.token instead, checked once at connect time
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Not authenticated"));

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as SocketUser;

    if (!user.clinicId) {
      // SUPER_ADMIN, not scoped to a clinic — nothing to join
      return;
    }

    socket.join(`clinic:${user.clinicId}`);

    const frontDeskRoles = ["ADMIN", "RECEPTIONIST"];
    if (frontDeskRoles.includes(user.role)) {
      socket.join(`clinic:${user.clinicId}:frontdesk`);
    }

    console.log(`socket connected: user ${user.id} -> clinic:${user.clinicId}`);
  });

  return io;
}

function getIO(): SocketIOServer | null {
  return io ?? null;
}

export default { initSocket, getIO };
