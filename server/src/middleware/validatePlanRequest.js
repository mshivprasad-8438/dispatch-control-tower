const { createHttpError } = require("../services/planService");

function validatePlanRequest(req, res, next) {
  const { vehicleNo, orderIds } = req.body || {};

  if (!vehicleNo || typeof vehicleNo !== "string") {
    return next(createHttpError(400, "vehicleNo is required."));
  }

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return next(createHttpError(400, "orderIds must be a non-empty array."));
  }

  if (!orderIds.every((orderId) => typeof orderId === "string" && orderId.trim())) {
    return next(createHttpError(400, "orderIds must contain valid order ids."));
  }

  const uniqueOrderIds = new Set(orderIds);

  if (uniqueOrderIds.size !== orderIds.length) {
    return next(createHttpError(400, "orderIds must not contain duplicates."));
  }

  return next();
}

module.exports = validatePlanRequest;
