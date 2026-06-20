const fs = require("fs");
const path = require("path");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const Vehicle = require("../models/vehicleModel");
const Plan = require("../models/planModel");
const { getVehicleStatusKey } = require("../constants/statuses");

function resolveSeedPath(fileName) {
  const candidatePaths = [
    path.resolve(__dirname, "../../../data", fileName),
    path.resolve(__dirname, "../../data", fileName),
  ];

  const resolvedPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!resolvedPath) {
    throw new Error(`Seed file not found: ${fileName}`);
  }

  return resolvedPath;
}

const customers = require(resolveSeedPath("customers.json"));
const orders = require(resolveSeedPath("orders.json"));
const vehicles = require(resolveSeedPath("vehicles.json"));

function normalizeVehicles(seedVehicles) {
  return seedVehicles.map((vehicle) => ({
    ...vehicle,
    status: getVehicleStatusKey(vehicle.status),
  }));
}

async function areCollectionsEmpty() {
  const counts = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Vehicle.countDocuments(),
    Plan.countDocuments(),
  ]);

  return counts.every((count) => count === 0);
}

async function importSeedData() {
  await Promise.all([
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Vehicle.deleteMany({}),
    Plan.deleteMany({}),
  ]);

  await Customer.insertMany(customers);
  await Order.insertMany(orders);
  await Vehicle.insertMany(normalizeVehicles(vehicles));
}

async function seedIfEmpty() {
  const shouldSeed = await areCollectionsEmpty();

  if (shouldSeed) {
    await importSeedData();
  }
}

module.exports = {
  importSeedData,
  seedIfEmpty,
};
