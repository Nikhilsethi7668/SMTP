import mongoose from "mongoose";
import { PreWarmedDomain } from "../models/unifiedDomainModel.js";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";

dotenv.config();

// Generate dummy pre-warmed domain data
const generateDummyData = () => {
  const domains = [
    "examplemail.com",
    "businesshub.net",
    "techcorp.io",
    "startupmail.co",
    "enterprise.org",
    "digitalflow.app",
    "cloudmail.dev",
    "innovatehub.tech",
    "smartmail.online",
    "prodomain.store",
  ];

  const personas = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Jessica Martinez",
    "Christopher Anderson",
    "Amanda Taylor",
    "Matthew Thomas",
    "Lisa Jackson",
    "Daniel White",
    "Ashley Harris",
    "James Martin",
    "Michelle Thompson",
    "Robert Garcia",
  ];

  const providers: ("gmail" | "outlook" | "custom")[] = ["gmail", "outlook", "custom"];

  const dummyDomains = domains.map((domain, domainIndex) => {
    // Generate 3-8 emails per domain
    const emailCount = Math.floor(Math.random() * 6) + 3;
    const emails = [];

    for (let i = 0; i < emailCount; i++) {
      const personaIndex = (domainIndex * emailCount + i) % personas.length;
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const emailStatus: "available" | "warmingup" = Math.random() > 0.3 ? "available" : "warmingup";
      
      // Generate email address
      const emailPrefix = personas[personaIndex].toLowerCase().replace(/\s+/g, ".");
      const email = `${emailPrefix}@${domain}`;

      emails.push({
        email,
        persona: personas[personaIndex],
        status: emailStatus,
        provider,
        price: Math.floor(Math.random() * 15) + 5, // Random price between 5-20
      });
    }

    return {
      domain,
      domainType: "preWarmed",
      emails,
      domainPrice: Math.floor(Math.random() * 20) + 10, // Random price between 10-30
      emailPrice: Math.floor(Math.random() * 10) + 5, // Random price between 5-15
      status: "available" as const,
      warmingup: Math.random() > 0.5, // Random warmup status
    };
  });

  return dummyDomains;
};

const seedPreWarmedDomains = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Generate dummy data
    const dummyData = generateDummyData();
    console.log(`📦 Generated ${dummyData.length} dummy domains`);

    // Clear existing available domains (optional - uncomment if you want to clear)
    // await PreWarmedDomain.deleteMany({ domainType: "preWarmed", status: "available" });
    // console.log("🗑️  Cleared existing available pre-warmed domains");

    // Insert the dummy data
    const result = await PreWarmedDomain.insertMany(dummyData);
    console.log(`✅ Successfully inserted ${result.length} pre-warmed domains`);

    // Count total emails
    const totalEmails = dummyData.reduce(
      (sum, domain) => sum + domain.emails.length,
      0
    );
    console.log(`📧 Total emails created: ${totalEmails}`);

    // Display summary
    console.log("\n📊 Summary:");
    console.log(`   - Domains: ${result.length}`);
    console.log(`   - Total Emails: ${totalEmails}`);
    console.log(`   - Average Emails per Domain: ${(totalEmails / result.length).toFixed(1)}`);

    const availableEmails = dummyData.reduce(
      (sum, domain) =>
        sum + domain.emails.filter((e) => e.status === "available").length,
      0
    );
    const warmingupEmails = totalEmails - availableEmails;
    console.log(`   - Available Emails: ${availableEmails}`);
    console.log(`   - Warming Up Emails: ${warmingupEmails}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding pre-warmed domains:", error);
    if (error.code === 11000) {
      console.error("⚠️  Duplicate domain detected. Some domains may already exist.");
    }
    process.exit(1);
  }
};

seedPreWarmedDomains();

