
export const startWorkers = async () => {
  try {
    console.log("Initializing database tables...");
  } catch (err) {
    console.error("Error starting workers:", err);
  }
};

// Start all workers
startWorkers();
