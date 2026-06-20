const mongoose = require("mongoose");

const vehicleSnapshotSchema = new mongoose.Schema(
  {
    vehicleNo: { type: String, required: true },
    capacityMT: { type: Number, required: true },
    model: { type: String, required: true },
  },
  { _id: false }
);

const lineItemSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    product: { type: String, required: true },
    qtyMT: { type: Number, required: true },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true, unique: true, index: true },
    vehicle: { type: vehicleSnapshotSchema, required: true },
    orderIds: { type: [String], default: [] },
    lineItems: { type: [lineItemSchema], default: [] },
    totalLoadedMT: { type: Number, required: true },
    capacityMT: { type: Number, required: true },
    remainingMT: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Plan", planSchema);
