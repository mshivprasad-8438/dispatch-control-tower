const customers = require("../../../data/customers.json");
const orders = require("../../../data/orders.json");
const vehicles = require("../../../data/vehicles.json");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const Vehicle = require("../models/vehicleModel");
const Plan = require("../models/planModel");

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
  await Vehicle.insertMany(vehicles);
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
