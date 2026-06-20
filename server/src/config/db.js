const mongoose = require("mongoose");

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dispatch-control-tower";
  const maxAttempts = Number.parseInt(process.env.MONGODB_CONNECT_RETRIES || "10", 10);
  const retryDelayMs = Number.parseInt(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || "2000", 10);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(mongoUri);
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      await wait(retryDelayMs);
    }
  }
}

module.exports = {
  connectDatabase,
};
