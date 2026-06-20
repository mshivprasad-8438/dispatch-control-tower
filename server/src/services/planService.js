const { getState } = require("../data/store");
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

function getVehicleByNumber(vehicleNo) {
  const state = getState();
  return state.vehicles.find((vehicle) => vehicle.vehicleNo === vehicleNo);
}

function getCustomerById(customerId) {
  const state = getState();
  return state.customers.find((customer) => customer.customerId === customerId);
}

function getOrdersByIds(orderIds) {
  const state = getState();

  return orderIds.map((orderId) => {
    const order = state.orders.find((item) => item.orderId === orderId);

    if (!order) {
      throw createHttpError(404, `Order ${orderId} not found.`);
    }

    return order;
  });
}

function validateVehicle(vehicleNo) {
  const vehicle = getVehicleByNumber(vehicleNo);

  if (!vehicle) {
    throw createHttpError(404, `Vehicle ${vehicleNo} not found.`);
  }

  if (vehicle.status !== "Available") {
    throw createHttpError(400, `Vehicle ${vehicle.vehicleNo} is not available for planning.`);
  }

  return vehicle;
}

function validateOrders(orders) {
  for (const order of orders) {
    if (order.assignedPlanId) {
      throw createHttpError(400, `Order ${order.orderId} is already assigned.`);
    }

    const customer = getCustomerById(order.customerId);

    if (!customer) {
      throw createHttpError(404, `Customer ${order.customerId} not found.`);
    }

    const credit = getCreditStatus(customer);

    if (credit.creditStatus === "BLOCKED") {
      throw createHttpError(400, `Order ${order.orderId} is blocked. ${credit.creditReason}`);
    }
  }
}

function createPlan(payload) {
  const state = getState();
  const vehicle = validateVehicle(payload.vehicleNo);
  const orders = getOrdersByIds(payload.orderIds);

  validateOrders(orders);

  if (exceedsVehicleCapacity(orders, vehicle)) {
    const totalLoadedMT = getTotalPlannedQuantity(orders);

    throw createHttpError(
      400,
      `Vehicle capacity exceeded. Total ${totalLoadedMT} MT exceeds ${vehicle.capacityMT} MT.`
    );
  }

  const totalLoadedMT = getTotalPlannedQuantity(orders);
  const planId = generatePlanId(state.nextPlanNumber);
  state.nextPlanNumber += 1;

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

  state.plans.push(plan);
  vehicle.status = "Planned";

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
