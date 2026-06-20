const mongoose = require("mongoose");

const deliveryLocationSchema = new mongoose.Schema(
  {
    locationId: { type: String, required: true },
    label: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    creditLimit: { type: Number, required: true },
    creditDays: { type: Number, required: true },
    outstandingBalance: { type: Number, required: true },
    oldestOverdueInvoiceDays: { type: Number, required: true },
    deliveryLocations: { type: [deliveryLocationSchema], default: [] },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Customer", customerSchema);
