import mongoose from "mongoose";
import { PreWarmedDomain } from "../models/unifiedDomainModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON file
const preWarmedDomainsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/preWarmedDomains.json"), "utf-8")
);

dotenv.config();

const importPreWarmedDomains = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing data (optional - comment out if you want to keep existing)
    // await PreWarmedDomain.deleteMany({ status: "available" });
    // console.log("Cleared existing pre-warmed domains");

    // Insert the data with domainType set
    const dataWithType = preWarmedDomainsData.map((domain: any) => ({
      ...domain,
      domainType: 'preWarmed', // Set domain type for unified model
    }));
    const result = await PreWarmedDomain.insertMany(dataWithType);
    console.log(`✅ Successfully imported ${result.length} pre-warmed domains`);

    // Count total emails
    const totalEmails = preWarmedDomainsData.reduce(
      (sum, domain) => sum + domain.emails.length,
      0
    );
    console.log(`📧 Total emails imported: ${totalEmails}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing pre-warmed domains:", error);
    process.exit(1);
  }
};

importPreWarmedDomains();

