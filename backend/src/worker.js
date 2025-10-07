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

export const startWorkers = async () => {
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
    console.log("All workers started successfully ✅");
  } catch (err) {
    console.error("Error starting workers:", err);
  }
};

// Start all workers
startWorkers();
