import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

// the backend URL, not the /api/v1 path — sockets connect at the root
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace(
  /\/api\/v1\/?$/,
  "",
);

export function connectSocket(getToken: () => string | null): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    // a function, not a static value — re-evaluated on every reconnect
    // attempt, so a refreshed access token is picked up automatically
    auth: (cb) => cb({ token: getToken() }),
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
