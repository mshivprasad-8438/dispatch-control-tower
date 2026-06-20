const express = require("express");
const { getVehicles } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ data: getVehicles() });
});

module.exports = router;
