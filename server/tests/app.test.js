const request = require("supertest");
const app = require("../src/app");
const Order = require("../src/models/orderModel");
const Plan = require("../src/models/planModel");
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

describe("Dispatch Control Tower API", () => {
  test("marks an order blocked when outstanding balance exceeds credit limit", async () => {
    const response = await request(app).get("/api/orders");

    expect(response.status).toBe(200);

    const order = response.body.data.find((item) => item.orderId === "O-5003");

    expect(order.creditStatus).toBe("BLOCKED");
    expect(order.creditReason).toContain("Outstanding ₹540000 exceeds credit limit ₹500000");
  });

  test("marks an order blocked when overdue invoice days exceed credit days", async () => {
    const response = await request(app).get("/api/orders");

    expect(response.status).toBe(200);

    const order = response.body.data.find((item) => item.orderId === "O-5006");

    expect(order.creditStatus).toBe("BLOCKED");
    expect(order.creditReason).toContain("Oldest overdue invoice 40 days exceeds credit days 30");
  });

  test("rejects saving a plan with a blocked order even if called directly", async () => {
    const response = await request(app).post("/api/plans").send({
      vehicleNo: "AP28T-7457",
      orderIds: ["O-5003"],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Order O-5003 is blocked");
  });

  test("rejects saving a plan when total quantity exceeds vehicle capacity", async () => {
    const response = await request(app).post("/api/plans").send({
      vehicleNo: "AP28T-7457",
      orderIds: ["O-5001", "O-5010"],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Vehicle capacity exceeded. Total 22 MT exceeds 20 MT.");
  });

  test("rejects saving a plan when the vehicle is not available", async () => {
    const response = await request(app).post("/api/plans").send({
      vehicleNo: "AP28T-1188",
      orderIds: ["O-5001"],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Vehicle AP28T-1188 is not available for planning.");
  });

  test("rejects invalid plan payloads", async () => {
    const response = await request(app).post("/api/plans").send({
      vehicleNo: "",
      orderIds: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("vehicleNo is required.");
  });

  test("rejects malformed JSON with a safe error message", async () => {
    const response = await request(app)
      .post("/api/plans")
      .set("Content-Type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid JSON payload.");
  });

  test("saves a valid plan, returns loading sheet, hides assigned order, and marks vehicle planned", async () => {
    const saveResponse = await request(app).post("/api/plans").send({
      vehicleNo: "AP28T-7457",
      orderIds: ["O-5001"],
    });

    expect(saveResponse.status).toBe(201);
    expect(saveResponse.body.data).toMatchObject({
      planId: "PLAN-0001",
      totalLoadedMT: 12,
      capacityMT: 20,
      remainingMT: 8,
      vehicle: {
        vehicleNo: "AP28T-7457",
      },
      lineItems: [
        {
          orderId: "O-5001",
          product: "Shrimp Feed CP 0.8mm",
          qtyMT: 12,
        },
      ],
    });

    const ordersResponse = await request(app).get("/api/orders");
    const vehiclesResponse = await request(app).get("/api/vehicles");

    expect(ordersResponse.body.data.some((item) => item.orderId === "O-5001")).toBe(false);

    const vehicle = vehiclesResponse.body.data.find((item) => item.vehicleNo === "AP28T-7457");
    expect(vehicle.status).toBe("Planned");
  });

  test("rejects admin reset with an invalid secret key", async () => {
    const response = await request(app)
      .post("/api/admin/reset-data")
      .set("x-admin-reset-key", "wrong-key");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized reset request.");
  });

  test("resets Mongo data from seed files with a valid admin key", async () => {
    await request(app).post("/api/plans").send({
      vehicleNo: "AP28T-7457",
      orderIds: ["O-5001"],
    });

    const resetResponse = await request(app)
      .post("/api/admin/reset-data")
      .set("x-admin-reset-key", process.env.ADMIN_RESET_KEY);

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe("Database reset from seed data completed.");

    const [order, vehicle, planCount] = await Promise.all([
      Order.findOne({ orderId: "O-5001" }).lean(),
      Vehicle.findOne({ vehicleNo: "AP28T-7457" }).lean(),
      Plan.countDocuments(),
    ]);

    expect(order.assignedPlanId).toBeNull();
    expect(order.assignedVehicleNo).toBeNull();
    expect(order.status).toBe("PENDING");
    expect(vehicle.status).toBe("Available");
    expect(planCount).toBe(0);
  });
});
