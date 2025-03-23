const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require("mongoose-paginate-v2");

const stockSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      // required: true,
      trim: true,
    },
    stock_name: {
      type: String,
      required: true,
      trim: true,
    },
    buying_price: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    selling_price: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock_tax: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    pe_ratio: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    volume: {
      type: Number,
      default: 0,
      min: 0,
    },
    eps: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    stock_type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    market_cap: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    investment_type: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

stockSchema.plugin(mongoosePaginate);
stockSchema.plugin(aggregatePaginate);

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;
