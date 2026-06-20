const express = require("express");
const Vehicle = require("../models/vehicleModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().lean();
    return res.json({ data: vehicles });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
