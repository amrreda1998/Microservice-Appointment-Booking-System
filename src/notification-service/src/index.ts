import express from "express";
import cors from "cors";
import { connectMongoDB } from "./config/mongodbConfig";
import { connectRedis } from "./config/redisConfig";

import { startListening } from "./utils/messageConsumer";
import notificationRoutes from "./routes/notificationRoutes";
import logger from "./utils/logger";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());

//TODO: add swagger documentation
app.use("/api/notifications", notificationRoutes);
app.get("/api/health/notifications", (req, res) => res.json({ status: "ok" }));

const startServer = async () => {
  try {
    // Connect databases
    await connectMongoDB();
    await connectRedis();

    // Start listening for messages
    await startListening();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
      logger.info(`Ready for async notifications!`);
    });
  } catch (error) {
    logger.error("Failed to start:", error);
    process.exit(1);
  }
};

startServer();
