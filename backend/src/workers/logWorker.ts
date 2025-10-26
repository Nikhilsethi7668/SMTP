import { deleteOldLogs, getLogs } from "../services/logService.js";
import { deleteOldUsage } from "../services/quotaUsageService.js";

/**
 * Log Worker
 * - Cleans old logs
 * - Cleans old quota usage entries
 * - Can send metrics to monitoring systems
 */

const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const LOG_RETENTION_DAYS = 30;           // Keep logs for 30 days
const USAGE_RETENTION_DAYS = 90;         // Keep historical quota usage for 90 days

export const startLogWorker = () => {
  console.log("Log Worker started...");

  const cleanupTask = async () => {
    try {
      console.log("Running log cleanup...");

      // Delete old email logs
      await deleteOldLogs(LOG_RETENTION_DAYS);
      console.log(`Deleted logs older than ${LOG_RETENTION_DAYS} days`);

      // Delete old quota usage
      await deleteOldUsage(USAGE_RETENTION_DAYS);
      console.log(`Deleted quota usage older than ${USAGE_RETENTION_DAYS} days`);

      // Optionally, push metrics (e.g., logs count) to Prometheus/Grafana here
      // const logs = await getLogs(null, 1);
      // metrics.gauge('logs_count', logs.length);
    } catch (err) {
      console.error("Log Worker Error:", err);
    }
  };

  // Run immediately on start
  cleanupTask();

  // Schedule periodic cleanup
  setInterval(cleanupTask, CLEANUP_INTERVAL);
};
