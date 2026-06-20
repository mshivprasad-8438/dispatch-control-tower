const {
  exceedsVehicleCapacity,
  getTotalPlannedQuantity,
} = require("../src/services/capacityService");

describe("capacityService", () => {
  test("calculates total planned quantity", () => {
    const total = getTotalPlannedQuantity([{ qtyMT: 12 }, { qtyMT: 8 }, { qtyMT: 6 }]);

    expect(total).toBe(26);
  });

  test("returns false when planned quantity is within vehicle capacity", () => {
    const result = exceedsVehicleCapacity([{ qtyMT: 12 }, { qtyMT: 8 }], {
      capacityMT: 20,
    });

    expect(result).toBe(false);
  });

  test("returns true when planned quantity exceeds vehicle capacity", () => {
    const result = exceedsVehicleCapacity([{ qtyMT: 12 }, { qtyMT: 10 }], {
      capacityMT: 20,
    });

    expect(result).toBe(true);
  });
});
