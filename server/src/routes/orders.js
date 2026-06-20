const express = require("express");
const { getState } = require("../data/store");
const { getCreditStatus } = require("../services/creditService");

const router = express.Router();

router.get("/", (req, res) => {
  const state = getState();

  const openOrders = state.orders
    .filter((order) => !order.assignedPlanId)
    .map((order) => {
      const customer = state.customers.find((item) => item.customerId === order.customerId);
      const credit = getCreditStatus(customer);

      return {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: customer.name,
        destination: order.destination,
        product: order.product,
        qtyMT: order.qtyMT,
        status: order.status,
        creditStatus: credit.creditStatus,
        creditReason: credit.creditReason,
      };
    });

  res.json({ data: openOrders });
});

module.exports = router;
