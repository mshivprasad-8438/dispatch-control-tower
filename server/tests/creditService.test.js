const { getCreditStatus } = require("../src/services/creditService");

describe("creditService", () => {
  test("returns BLOCKED when outstanding balance exceeds credit limit", () => {
    const result = getCreditStatus({
      outstandingBalance: 540000,
      creditLimit: 500000,
      oldestOverdueInvoiceDays: 0,
      creditDays: 30,
    });

    expect(result).toEqual({
      creditStatus: "BLOCKED",
      creditReason: "Outstanding ₹540000 exceeds credit limit ₹500000",
    });
  });

  test("returns BLOCKED when overdue invoice days exceed credit days", () => {
    const result = getCreditStatus({
      outstandingBalance: 1000,
      creditLimit: 500000,
      oldestOverdueInvoiceDays: 40,
      creditDays: 30,
    });

    expect(result).toEqual({
      creditStatus: "BLOCKED",
      creditReason: "Oldest overdue invoice 40 days exceeds credit days 30",
    });
  });

  test("returns OK when customer is within credit rules", () => {
    const result = getCreditStatus({
      outstandingBalance: 300000,
      creditLimit: 500000,
      oldestOverdueInvoiceDays: 10,
      creditDays: 30,
    });

    expect(result).toEqual({
      creditStatus: "OK",
      creditReason: null,
    });
  });
});
