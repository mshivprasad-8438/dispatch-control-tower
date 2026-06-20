const cors = require("cors");
const express = require("express");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const ordersRouter = require("./routes/orders");
const plansRouter = require("./routes/plans");
const vehiclesRouter = require("./routes/vehicles");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Dispatch Control Tower API is running" });
});

app.use("/api/orders", ordersRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/plans", plansRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
