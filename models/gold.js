const mongoose = require("mongoose");

const goldInvestmentSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    investType: {
      type: String,
      enum: ["Digital Gold", "EIF", "Sovereign Gold Bond"],
      required: true,
    },
    investAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 1, // Minimum ₹1 investment
    },
    quantity: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0.01, // Typically gold is measured in grams
    },
    lockInPeriod: {
      type: Number, // Stored in months or years
      default: 0,
      min: 0,
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

const GoldInvestment = mongoose.model("GoldInvestment", goldInvestmentSchema);
module.exports = GoldInvestment;
