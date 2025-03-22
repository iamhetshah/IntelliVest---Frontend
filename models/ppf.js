const mongoose = require("mongoose");

const ppfSchema = new mongoose.Schema(
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
    },
    frequency: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    interestRate: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0.0,
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    investment_type: {
      type: String,
    },
  },
  { timestamps: true }
);

const PPF = mongoose.model("PPF", ppfSchema);
module.exports = PPF;
