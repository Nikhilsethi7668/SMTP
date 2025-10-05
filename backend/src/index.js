import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { pool } from "./config/db.js";
import { redisClient } from "./config/redisClient.js";

import { startPolicyServer } from "./services/policyEngine.js";
import { startWorkers } from "./worker.js";

// Routes
import apiRoutes from "./routes/apiRoutes.js";
import policyRoutes from "./routes/policyRoutes.js"; // optional REST endpoints for policy checks

// DB Initialization
import { initUserTable } from "./models/userModel.js";
import { initQuotaTable } from "./models/quotaModel.js";
import { initQuotaUsageTable } from "./models/quotaUsageModel.js";
import { initIPPoolTable } from "./models/ipPoolModel.js";
import { initDomainTable } from "./models/domainModel.js";
import { initBlacklistTable } from "./models/blacklistModel.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // --- 1. Initialize Postgres tables ---
    console.log("Initializing DB tables...");
    await initUserTable();
    await initQuotaTable();
    await initQuotaUsageTable();
    await initIPPoolTable();
    await initDomainTable();
    await initBlacklistTable();
    console.log("Database initialized ✅");

    // --- 2. Connect Redis ---
    redisClient.on("connect", () => console.log("Redis connected ✅"));
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();

    // --- 3. Start background workers ---
    startWorkers();

    // --- 4. Start Express API ---
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    // Health check
    app.get("/health", (req, res) => res.json({ status: "ok" }));

    // Routes
    app.use("/api", apiRoutes);
    app.use("/policy", policyRoutes);

    app.listen(PORT, () => {
      console.log(`Admin API server running on port ${PORT}`);
    });

    // --- 5. Start Postfix Policy TCP server ---
    const POLICY_PORT = process.env.POLICY_PORT || 10030;
    startPolicyServer(POLICY_PORT);
    console.log(`Policy Engine running on TCP port ${POLICY_PORT}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

// Start everything
startServer();
