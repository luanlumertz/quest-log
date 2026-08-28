import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT_LOCAL;

const server = app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

async function shutdown() {
  console.log("Shutting down server...");

  server.close(async () => {
    await prisma.$disconnect();

    console.log("Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);