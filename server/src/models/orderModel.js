const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    destination: { type: String, required: true },
    product: { type: String, required: true },
    qtyMT: { type: Number, required: true },
    orderDate: { type: String, required: true },
    status: { type: String, required: true },
    assignedPlanId: { type: String, default: null },
    assignedVehicleNo: { type: String, default: null },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Order", orderSchema);
