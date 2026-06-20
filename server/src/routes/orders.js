const express = require("express");
const { CREDIT_STATUS } = require("../constants/statuses");
const MESSAGES = require("../constants/messages");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const { getCreditStatus } = require("../services/creditService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [customers, orders] = await Promise.all([
      Customer.find().lean(),
      Order.find({ assignedPlanId: null }).lean(),
    ]);

    const customersById = new Map(customers.map((customer) => [customer.customerId, customer]));

    const openOrders = orders.map((order) => {
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

    return res.json({ data: openOrders });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
