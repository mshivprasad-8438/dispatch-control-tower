const cors = require("cors");
const express = require("express");
const adminRouter = require("./routes/admin");
const MESSAGES = require("./constants/messages");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const ordersRouter = require("./routes/orders");
const plansRouter = require("./routes/plans");
const vehiclesRouter = require("./routes/vehicles");

const app = express();

app.disable("x-powered-by");
app.set("etag", false);
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/health", (req, res) => {
  res.json({ message: MESSAGES.HEALTH_OK });
});

app.use("/api/orders", ordersRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/plans", plansRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
