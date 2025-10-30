import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js"
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import keyRoutes from "./routes/keyRoutes.js";
import { startPolicyServer } from "./services/policyEngine.js";
import { connectDB } from "./config/db.js";
import { initPricingTable } from "./services/pricingService.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import emailTemplateRoutes from "./routes/emailTemplateRoutes.js";
import incomingEmailRoutes from "./routes/incomingEmailRoutes.js";
import googleOauthRoutes from "./routes/googleOauth.js";
import outlookAuthRoutes from "./routes/outlookAuth.js";
import customConnectRoutes from "./routes/customConnect.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    const app = express();
    app.use(cors({
      origin:"http://localhost:8080",
      credentials: true
    }))
    app.use(cookieParser()); 
    app.use(bodyParser.json());
        await connectDB();

    app.get("/health", (req, res) => res.json({ status: "ok" }));
    app.use("/api", apiRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/", campaignRoutes);
    app.use("/api/payment", paymentRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/keys", keyRoutes);
    app.use('/api/leads', leadsRoutes);
    app.use('/api/email-templates', emailTemplateRoutes);
    app.use('/api/incoming-emails', incomingEmailRoutes);
    app.use('/api', googleOauthRoutes);
    app.use('/api', outlookAuthRoutes);
    app.use('/api', customConnectRoutes);
    app.listen(PORT, () => {
      console.log(`Admin API server running on port ${PORT}`);
    });

    const POLICY_PORT = Number(process.env.POLICY_PORT) || 10031;
    startPolicyServer(POLICY_PORT);
    console.log(`Policy Engine running on TCP port ${POLICY_PORT}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
