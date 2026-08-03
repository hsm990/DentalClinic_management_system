import "dotenv/config";
import http from "http";
import app from "./app";
import prisma from "./config/prisma";
import sockets from "./sockets";
const PORT = process.env.PORT || 4000;

async function main() {
  await prisma.$connect();
  console.log("Connected to database");

  const httpServer = http.createServer(app);
  sockets.initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
