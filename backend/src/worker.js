import { startLogWorker } from "./workers/logWorker.js";
import { resetDailyQuotas, resetMonthlyQuotas } from "./services/quotaService.js";
import { initUserTable } from "./models/userModel.js";
import { initQuotaTable } from "./models/quotaModel.js";
import { initQuotaUsageTable } from "./models/quotaUsageModel.js";
import { initIPPoolTable } from "./models/ipPoolModel.js";
import { initDomainTable } from "./models/domainModel.js";
import { initBlacklistTable } from "./models/blacklistModel.js";

/**
 * Worker entry point
 * Initializes DB tables and starts background tasks
 */

const startWorkers = async () => {
  try {
    console.log("Initializing database tables...");
    await initUserTable();
    await initQuotaTable();
    await initQuotaUsageTable();
    await initIPPoolTable();
    await initDomainTable();
    await initBlacklistTable();

    console.log("Starting log worker...");
    startLogWorker();

    console.log("Starting daily quota reset worker...");
    // Run immediately and then every 24h
    const dailyReset = async () => {
      await resetDailyQuotas();
      console.log("Daily quotas reset completed");
    };
    await dailyReset();
    setInterval(dailyReset, 1000 * 60 * 60 * 24);

    console.log("Starting monthly quota reset worker...");
    // Run immediately and then every 30 days
    const monthlyReset = async () => {
      await resetMonthlyQuotas();
      console.log("Monthly quotas reset completed");
    };
    await monthlyReset();
    setInterval(monthlyReset, 1000 * 60 * 60 * 24 * 30);

    console.log("All workers started successfully ✅");
  } catch (err) {
    console.error("Error starting workers:", err);
  }
};

// Start all workers
startWorkers();
