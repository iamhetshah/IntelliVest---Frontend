const mongoose = require("mongoose");

const mutualFundSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    investName: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fundType: {
      type: String,
      enum: ["Equity", "Hybrid", "Index", "Debt"],
      required: true,
    },
    investType: {
      type: String,
      enum: ["LUMP SUM", "SIP"],
      required: true,
    },
    investAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      //   min: 100, // Minimum amount typically for SIP or LUMP SUM
    },
    riskProfile: {
      type: String,
      enum: ["Low", "Medium", "High"],
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

const MutualFund = mongoose.model("MutualFund", mutualFundSchema);
module.exports = MutualFund;
