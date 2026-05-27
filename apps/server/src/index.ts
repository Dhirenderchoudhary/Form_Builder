import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server.js";
import { env } from "./env.js";

async function main() {
  try{
  const server = http.createServer(expressApplication);
  const PORT = Number(env.PORT) || 8000;

  server.listen(PORT, () => {
    logger.info("Server running", { port: PORT, env: env.NODE_ENV });
  });

  server.on("error", (error) => {
    logger.error("Server error", { error });
    process.exit(1);
  });
}
catch(error){
  logger.error("Failed to start server", { error });
  process.exit(1);
}
}
main()
