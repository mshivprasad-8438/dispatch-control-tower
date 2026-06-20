const express = require("express");
const { getState } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  const state = getState();
  res.json({ data: state.vehicles });
});

module.exports = router;
