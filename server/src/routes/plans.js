const express = require("express");
const validatePlanRequest = require("../middleware/validatePlanRequest");
const { createPlan } = require("../services/planningService");

const router = express.Router();

router.post("/", validatePlanRequest, async (req, res, next) => {
  try {
    const plan = await createPlan(req.body);
    return res.status(201).json({ data: plan });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
