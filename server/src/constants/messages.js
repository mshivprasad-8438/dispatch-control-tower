const MESSAGES = {
  HEALTH_OK: "Dispatch Control Tower API is running",
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_JSON: "Invalid JSON payload.",
  VEHICLE_NO_REQUIRED: "vehicleNo is required.",
  ORDER_IDS_REQUIRED: "orderIds must be a non-empty array.",
  ORDER_IDS_INVALID: "orderIds must contain valid order ids.",
  ORDER_IDS_DUPLICATE: "orderIds must not contain duplicates.",
  CUSTOMER_DATA_MISSING: (customerId) => `Customer record ${customerId} not found.`,
  ROUTE_NOT_FOUND: (method, url) => `Route not found: ${method} ${url}`,
  VEHICLE_NOT_FOUND: (vehicleNo) => `Vehicle ${vehicleNo} not found.`,
  VEHICLE_NOT_AVAILABLE: (vehicleNo) => `Vehicle ${vehicleNo} is not available for planning.`,
  ORDER_NOT_FOUND: (orderId) => `Order ${orderId} not found.`,
  ORDER_ALREADY_ASSIGNED: (orderId) => `Order ${orderId} is already assigned.`,
  CUSTOMER_NOT_FOUND: (customerId) => `Customer ${customerId} not found.`,
  ORDER_BLOCKED: (orderId, reason) => `Order ${orderId} is blocked. ${reason}`,
  CAPACITY_EXCEEDED: (totalLoadedMT, capacityMT) =>
    `Vehicle capacity exceeded. Total ${totalLoadedMT} MT exceeds ${capacityMT} MT.`,
  CREDIT_LIMIT_EXCEEDED: (outstandingBalance, creditLimit) =>
    `Outstanding ₹${outstandingBalance} exceeds credit limit ₹${creditLimit}`,
  OVERDUE_EXCEEDED: (oldestOverdueInvoiceDays, creditDays) =>
    `Oldest overdue invoice ${oldestOverdueInvoiceDays} days exceeds credit days ${creditDays}`,
};

module.exports = MESSAGES;
