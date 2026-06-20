const request = require("supertest");
const app = require("../src/app");
const { resetState } = require("../src/data/store");

beforeEach(() => {
  resetState();
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
});
