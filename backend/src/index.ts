import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js"
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import keyRoutes from "./routes/keyRoutes.js";
import { startPolicyServer } from "./services/policyEngine.js";
import { connectDB } from "./config/db.js";
import { initPricingTable } from "./services/pricingService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
        await connectDB();
    await initPricingTable();

    app.get("/health", (req, res) => res.json({ status: "ok" }));
    app.use("/api", apiRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api", campaignRoutes);
    app.use("/api/payment", paymentRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/keys", keyRoutes);
    app

    app.listen(PORT, () => {
      console.log(`Admin API server running on port ${PORT}`);
    });

    const POLICY_PORT = Number(process.env.POLICY_PORT) || 10030;
    startPolicyServer(POLICY_PORT);
    console.log(`Policy Engine running on TCP port ${POLICY_PORT}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
