const { createPlan } = require("../src/services/planningService");
const Order = require("../src/models/orderModel");
const Vehicle = require("../src/models/vehicleModel");
const { importSeedData } = require("../src/services/seedService");
const { setupTestDatabase, teardownTestDatabase } = require("./support/mongoTestDb");

let mongoServer;

beforeAll(async () => {
  mongoServer = await setupTestDatabase();
});

beforeEach(async () => {
  await importSeedData();
});

afterAll(async () => {
  await teardownTestDatabase(mongoServer);
});

describe("planningService", () => {
  test("rejects a plan when vehicle is not available", async () => {
    await expect(
      createPlan({
        vehicleNo: "AP28T-1188",
        orderIds: ["O-5001"],
      })
    ).rejects.toThrow("Vehicle AP28T-1188 is not available for planning.");
  });

  test("rejects a plan when it contains a blocked order", async () => {
    await expect(
      createPlan({
        vehicleNo: "AP28T-7457",
        orderIds: ["O-5006"],
      })
    ).rejects.toThrow("Order O-5006 is blocked.");
  });

  test("creates a valid plan and updates Mongo state", async () => {
    const plan = await createPlan({
      vehicleNo: "AP16U-3321",
      orderIds: ["O-5002", "O-5005"],
    });

    const [vehicle, order] = await Promise.all([
      Vehicle.findOne({ vehicleNo: "AP16U-3321" }).lean(),
      Order.findOne({ orderId: "O-5002" }).lean(),
    ]);

    expect(plan).toMatchObject({
      planId: "PLAN-0001",
      totalLoadedMT: 14,
      capacityMT: 25,
      remainingMT: 11,
    });
    expect(vehicle.status).toBe("PLANNED");
    expect(order.assignedPlanId).toBe("PLAN-0001");
  });
});
