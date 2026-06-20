const express = require("express");
const MESSAGES = require("../constants/messages");
const adminAuth = require("../middleware/adminAuth");
const { importSeedData } = require("../services/seedService");

const router = express.Router();

router.post("/reset-data", adminAuth, async (req, res, next) => {
  try {
    await importSeedData();
    return res.json({ message: MESSAGES.ADMIN_RESET_SUCCESS });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
