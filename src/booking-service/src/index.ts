import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import logger from "./utils/logger";
import appointmentRoutes from "./routes/appointmentRoutes";
import { connectNotificationService } from "./services/notificationService";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/appointments", appointmentRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4002;

// Start everything
const startServer = async () => {
  try {
    // Connect to notification service
    await connectNotificationService();

    // Start server
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Booking Service started successfully");
    });
  } catch (error: any) {
    logger.error({ err: error.message }, "Error starting the server");
    process.exit(1);
  }
};

startServer();
