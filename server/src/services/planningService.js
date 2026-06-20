const { CREDIT_STATUS, VEHICLE_STATUS } = require("../constants/statuses");
const MESSAGES = require("../constants/messages");
const {
  getCustomers,
  getOrders,
  getPlans,
  getVehicles,
  getNextPlanNumber,
  incrementNextPlanNumber,
} = require("../data/store");
const { getCreditStatus } = require("./creditService");
const { exceedsVehicleCapacity, getTotalPlannedQuantity } = require("./capacityService");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function generatePlanId(nextPlanNumber) {
  return `PLAN-${String(nextPlanNumber).padStart(4, "0")}`;
}

function buildLookupMap(items, keyName) {
  return new Map(items.map((item) => [item[keyName], item]));
}

function getOrdersByIds(orderIds, ordersById) {
  return orderIds.map((orderId) => {
    const order = ordersById.get(orderId);

    if (!order) {
      throw createHttpError(404, MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  });
}

function validateVehicle(vehicleNo, vehiclesByNumber) {
  const vehicle = vehiclesByNumber.get(vehicleNo);

  if (!vehicle) {
    throw createHttpError(404, MESSAGES.VEHICLE_NOT_FOUND(vehicleNo));
  }

  if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) {
    throw createHttpError(400, MESSAGES.VEHICLE_NOT_AVAILABLE(vehicle.vehicleNo));
  }

  return vehicle;
}

function validateOrders(orders, customersById) {
  for (const order of orders) {
    if (order.assignedPlanId) {
      throw createHttpError(400, MESSAGES.ORDER_ALREADY_ASSIGNED(order.orderId));
    }

    const customer = customersById.get(order.customerId);

    if (!customer) {
      throw createHttpError(404, MESSAGES.CUSTOMER_NOT_FOUND(order.customerId));
    }

    const credit = getCreditStatus(customer);

    if (credit.creditStatus === CREDIT_STATUS.BLOCKED) {
      throw createHttpError(400, MESSAGES.ORDER_BLOCKED(order.orderId, credit.creditReason));
    }
  }
}

function createPlan(payload) {
  const vehiclesByNumber = buildLookupMap(getVehicles(), "vehicleNo");
  const ordersById = buildLookupMap(getOrders(), "orderId");
  const customersById = buildLookupMap(getCustomers(), "customerId");

  const vehicle = validateVehicle(payload.vehicleNo, vehiclesByNumber);
  const orders = getOrdersByIds(payload.orderIds, ordersById);

  validateOrders(orders, customersById);

  if (exceedsVehicleCapacity(orders, vehicle)) {
    const totalLoadedMT = getTotalPlannedQuantity(orders);

    throw createHttpError(400, MESSAGES.CAPACITY_EXCEEDED(totalLoadedMT, vehicle.capacityMT));
  }

  const totalLoadedMT = getTotalPlannedQuantity(orders);
  const planId = generatePlanId(getNextPlanNumber());
  incrementNextPlanNumber();

  const plan = {
    planId,
    vehicle: {
      vehicleNo: vehicle.vehicleNo,
      capacityMT: vehicle.capacityMT,
      model: vehicle.model,
    },
    orderIds: payload.orderIds.slice(),
    lineItems: orders.map((order) => ({
      orderId: order.orderId,
      product: order.product,
      qtyMT: order.qtyMT,
    })),
    totalLoadedMT,
    capacityMT: vehicle.capacityMT,
    remainingMT: vehicle.capacityMT - totalLoadedMT,
  };

  getPlans().push(plan);
  vehicle.status = VEHICLE_STATUS.PLANNED;

  orders.forEach((order) => {
    order.status = "ASSIGNED";
    order.assignedPlanId = planId;
    order.assignedVehicleNo = vehicle.vehicleNo;
  });

  return plan;
}

module.exports = {
  createHttpError,
  createPlan,
};
