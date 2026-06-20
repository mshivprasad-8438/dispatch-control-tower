const MESSAGES = require("../constants/messages");

function notFoundHandler(req, res) {
  return res.status(404).json({
    message: MESSAGES.ROUTE_NOT_FOUND(req.method, req.originalUrl),
  });
}

function errorHandler(error, req, res, next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: MESSAGES.INVALID_JSON,
    });
  }

  const status = error.status || 500;

  if (res.headersSent) {
    return next(error);
  }

  return res.status(status).json({
    message: status === 500 ? MESSAGES.INTERNAL_SERVER_ERROR : error.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
