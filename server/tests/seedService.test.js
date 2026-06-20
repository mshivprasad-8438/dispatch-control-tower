const customers = require("../../data/customers.json");
const orders = require("../../data/orders.json");
const vehicles = require("../../data/vehicles.json");
const Customer = require("../src/models/customerModel");
const Order = require("../src/models/orderModel");
const Vehicle = require("../src/models/vehicleModel");
const Plan = require("../src/models/planModel");
const { seedIfEmpty } = require("../src/services/seedService");
const {
  clearTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} = require("./support/mongoTestDb");

let mongoServer;

beforeAll(async () => {
  mongoServer = await setupTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase(mongoServer);
});

describe("seedService", () => {
  test("seeds MongoDB when collections are empty", async () => {
    await seedIfEmpty();

    const [customerCount, orderCount, vehicleCount, planCount] = await Promise.all([
      Customer.countDocuments(),
      Order.countDocuments(),
      Vehicle.countDocuments(),
      Plan.countDocuments(),
    ]);

    expect(customerCount).toBe(customers.length);
    expect(orderCount).toBe(orders.length);
    expect(vehicleCount).toBe(vehicles.length);
    expect(planCount).toBe(0);
  });

  test("does not reseed when collections already contain data", async () => {
    await seedIfEmpty();
    await Order.updateOne({ orderId: "O-5001" }, { $set: { status: "CUSTOM_STATUS" } });

    await seedIfEmpty();

    const [updatedOrder, orderCount] = await Promise.all([
      Order.findOne({ orderId: "O-5001" }).lean(),
      Order.countDocuments(),
    ]);

    expect(updatedOrder.status).toBe("CUSTOM_STATUS");
    expect(orderCount).toBe(orders.length);
  });
});
