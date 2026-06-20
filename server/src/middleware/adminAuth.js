const MESSAGES = require("../constants/messages");
const { createHttpError } = require("../services/planningService");

function adminAuth(req, res, next) {
  const providedKey = req.get("x-admin-reset-key");
  const expectedKey = process.env.ADMIN_RESET_KEY || "local-admin-reset-key";

  if (providedKey !== expectedKey) {
    return next(createHttpError(401, MESSAGES.ADMIN_RESET_UNAUTHORIZED));
  }

  return next();
}

module.exports = adminAuth;
