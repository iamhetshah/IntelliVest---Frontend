const mongoose = require("mongoose");

const fixedDepositSchema = new mongoose.Schema(
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
    investAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      //   min: 1000, // Minimum FD investment (usually ₹1000)
    },
    tenure: {
      type: Number, // In months or years
      required: true,
      min: 1, // Minimum 1 month
    },
    payoutOption: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly", "On Maturity"],
      required: true,
    },
    interestRate: {
      type: mongoose.Schema.Types.Decimal128,
    },
    investment_type: {
      type: String,
    },
  },
  { timestamps: true }
);

const FixedDeposit = mongoose.model("FixedDeposit", fixedDepositSchema);
module.exports = FixedDeposit;
