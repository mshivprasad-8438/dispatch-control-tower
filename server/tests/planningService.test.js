const { createPlan } = require("../src/services/planningService");
const { getState, resetState } = require("../src/data/store");

beforeEach(() => {
  resetState();
});

describe("planningService", () => {
  test("rejects a plan when vehicle is not available", () => {
    expect(() =>
      createPlan({
        vehicleNo: "AP28T-1188",
        orderIds: ["O-5001"],
      })
    ).toThrow("Vehicle AP28T-1188 is not available for planning.");
  });

  test("rejects a plan when it contains a blocked order", () => {
    expect(() =>
      createPlan({
        vehicleNo: "AP28T-7457",
        orderIds: ["O-5006"],
      })
    ).toThrow("Order O-5006 is blocked.");
  });

  test("creates a valid plan and updates in-memory state", () => {
    const plan = createPlan({
      vehicleNo: "AP16U-3321",
      orderIds: ["O-5002", "O-5005"],
    });

    const state = getState();
    const vehicle = state.vehicles.find((item) => item.vehicleNo === "AP16U-3321");
    const order = state.orders.find((item) => item.orderId === "O-5002");

    expect(plan).toMatchObject({
      planId: "PLAN-0001",
      totalLoadedMT: 14,
      capacityMT: 25,
      remainingMT: 11,
    });
    expect(vehicle.status).toBe("Planned");
    expect(order.assignedPlanId).toBe("PLAN-0001");
  });
});
