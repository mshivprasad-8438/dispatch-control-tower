const { CREDIT_STATUS, VEHICLE_STATUS_KEY, getVehicleStatusKey } = require("../constants/statuses");
const MESSAGES = require("../constants/messages");
const { getCreditStatus } = require("./creditService");
const { exceedsVehicleCapacity, getTotalPlannedQuantity } = require("./capacityService");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const Plan = require("../models/planModel");
const Vehicle = require("../models/vehicleModel");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function generatePlanId(nextPlanNumber) {
  return `PLAN-${String(nextPlanNumber).padStart(4, "0")}`;
}

function extractPlanSequence(planId) {
  const [, suffix = "0"] = planId.split("PLAN-");
  return Number.parseInt(suffix, 10) || 0;
}

async function getNextPlanId() {
  const latestPlan = await Plan.findOne().sort({ createdAt: -1 }).lean();
  const nextPlanNumber = latestPlan ? extractPlanSequence(latestPlan.planId) + 1 : 1;
  return generatePlanId(nextPlanNumber);
}

function validateVehicle(vehicleNo, vehicle) {
  if (!vehicle) {
    throw createHttpError(404, MESSAGES.VEHICLE_NOT_FOUND(vehicleNo));
  }

  if (getVehicleStatusKey(vehicle.status) !== VEHICLE_STATUS_KEY.AVAILABLE) {
    throw createHttpError(400, MESSAGES.VEHICLE_NOT_AVAILABLE(vehicle.vehicleNo));
  }

  return vehicle;
}

function validateOrderIds(orderIds, ordersById) {
  return orderIds.map((orderId) => {
    const order = ordersById.get(orderId);

    if (!order) {
      throw createHttpError(404, MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  });
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

async function createPlan(payload) {
  const [vehicle, orders, customers] = await Promise.all([
    Vehicle.findOne({ vehicleNo: payload.vehicleNo }),
    Order.find({ orderId: { $in: payload.orderIds } }),
    Customer.find(),
  ]);

  const ordersById = new Map(orders.map((order) => [order.orderId, order]));
  const customersById = new Map(customers.map((customer) => [customer.customerId, customer]));

  validateVehicle(payload.vehicleNo, vehicle);

  const selectedOrders = validateOrderIds(payload.orderIds, ordersById);

  validateOrders(selectedOrders, customersById);

  if (exceedsVehicleCapacity(selectedOrders, vehicle)) {
    const totalLoadedMT = getTotalPlannedQuantity(selectedOrders);

    throw createHttpError(400, MESSAGES.CAPACITY_EXCEEDED(totalLoadedMT, vehicle.capacityMT));
  }

  const totalLoadedMT = getTotalPlannedQuantity(selectedOrders);
  const planId = await getNextPlanId();

  const plan = {
    planId,
    vehicle: {
      vehicleNo: vehicle.vehicleNo,
      capacityMT: vehicle.capacityMT,
      model: vehicle.model,
    },
    orderIds: payload.orderIds.slice(),
    lineItems: selectedOrders.map((order) => ({
      orderId: order.orderId,
      product: order.product,
      qtyMT: order.qtyMT,
    })),
    totalLoadedMT,
    capacityMT: vehicle.capacityMT,
    remainingMT: vehicle.capacityMT - totalLoadedMT,
  };

  await Plan.create(plan);

  vehicle.status = VEHICLE_STATUS_KEY.PLANNED;
  await vehicle.save();

  await Promise.all(
    selectedOrders.map((order) => {
      order.status = "ASSIGNED";
      order.assignedPlanId = planId;
      order.assignedVehicleNo = vehicle.vehicleNo;
      return order.save();
    })
  );

  return plan;
}

module.exports = {
  createHttpError,
  createPlan,
};
