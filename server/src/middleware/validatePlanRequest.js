const MESSAGES = require("../constants/messages");
const { createHttpError } = require("../services/planningService");

function validatePlanRequest(req, res, next) {
  const { vehicleNo, orderIds } = req.body || {};

  if (!vehicleNo || typeof vehicleNo !== "string") {
    return next(createHttpError(400, MESSAGES.VEHICLE_NO_REQUIRED));
  }

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return next(createHttpError(400, MESSAGES.ORDER_IDS_REQUIRED));
  }

  if (!orderIds.every((orderId) => typeof orderId === "string" && orderId.trim())) {
    return next(createHttpError(400, MESSAGES.ORDER_IDS_INVALID));
  }

  const uniqueOrderIds = new Set(orderIds);

  if (uniqueOrderIds.size !== orderIds.length) {
    return next(createHttpError(400, MESSAGES.ORDER_IDS_DUPLICATE));
  }

  return next();
}

module.exports = validatePlanRequest;
