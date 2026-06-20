const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNo: { type: String, required: true, unique: true, index: true },
    capacityMT: { type: Number, required: true },
    model: { type: String, required: true },
    status: { type: String, required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
