import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import doctorsRoutes from "./routes/doctorRoutes";
import patientsRoutes from "./routes/patientRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import logger from "./utils/logger";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;

try {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Auth Service started successfully");
  });
} catch (error: any) {
  logger.error({ err: error.message }, "Error starting the server");
  process.exit(1);
}
