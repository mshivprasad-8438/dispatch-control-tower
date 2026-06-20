const express = require("express");
const { getVehicleStatusKey, getVehicleStatusLabel } = require("../constants/statuses");
const Plan = require("../models/planModel");
const Vehicle = require("../models/vehicleModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [vehicles, plans] = await Promise.all([Vehicle.find().lean(), Plan.find().lean()]);
    const loadByVehicleNo = new Map(plans.map((plan) => [plan.vehicle.vehicleNo, plan.totalLoadedMT]));
    const vehiclesWithLoad = vehicles.map((vehicle) => ({
      ...vehicle,
      status: getVehicleStatusKey(vehicle.status),
      statusKey: getVehicleStatusKey(vehicle.status),
      statusLabel: getVehicleStatusLabel(vehicle.status),
      currentLoadedMT: loadByVehicleNo.get(vehicle.vehicleNo) || 0,
    }));
    return res.json({ data: vehiclesWithLoad });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
