const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase } = require("../../src/config/db");

async function setupTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.ADMIN_RESET_KEY = "test-admin-reset-key";
  process.env.MONGODB_CONNECT_RETRIES = "1";

  await connectDatabase();

  return mongoServer;
}

async function clearTestDatabase() {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

async function teardownTestDatabase(mongoServer) {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  clearTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
};
