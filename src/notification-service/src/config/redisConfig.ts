import logger from "../utils/logger";
import { createClient } from "redis";

// Redis Connection
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Redis connected");
  } catch (error) {
    logger.error("Redis failed:", error);
    process.exit(1);
  }
};
