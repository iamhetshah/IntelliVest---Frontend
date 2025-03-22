const mongoose = require("mongoose");

const originalStockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true }
);

const originalStock = mongoose.model(
  "original_Stock",
  originalStockSchema
);
module.exports = originalStock;
