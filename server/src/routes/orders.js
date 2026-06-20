const express = require("express");
const { CREDIT_STATUS } = require("../constants/statuses");
const MESSAGES = require("../constants/messages");
const { getCustomers, getOrders } = require("../data/store");
const { getCreditStatus } = require("../services/creditService");

const router = express.Router();

router.get("/", (req, res) => {
  const customers = getCustomers();
  const orders = getOrders();
  const customersById = new Map(customers.map((customer) => [customer.customerId, customer]));

  const openOrders = orders
    .filter((order) => !order.assignedPlanId)
    .map((order) => {
      const customer = customersById.get(order.customerId);
      const credit = customer
        ? getCreditStatus(customer)
        : {
            creditStatus: CREDIT_STATUS.BLOCKED,
            creditReason: MESSAGES.CUSTOMER_DATA_MISSING(order.customerId),
          };

      return {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: customer ? customer.name : "Unknown Customer",
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
