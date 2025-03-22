const mongoose = require("mongoose");

const InvestmentDetailSchema = mongoose.Schema(
  {
    // investmentId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Investment",
    //   required: true,
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String, // Name of the platform (e.g., AngelList, Groww, etc.)
      required: true,
    },
    // platform_investment_id: {
    //   type: String, // Unique ID of the investment on the external platform
    //   required: true,
    // },
    investment_name: {
      type: String,
    },
    price: {
      type: Number,
    },
    market_cap: {
      type: Number,
    },
    volume: {
      type: Number,
    },
    open_price: {
      type: Number,
    },
    week_high_52: {
      type: Number,
    },
    week_low_52: {
      type: Number,
    },
    PE_ratio: {
      type: mongoose.Schema.Types.Decimal128,
    },
    EPS: {
      type: mongoose.Schema.Types.Decimal128,
    },
    month_high: {
      type: Number,
    },
    month_low: {
      type: Number,
    },
    week_high: {
      type: Number,
    },
    week_low: {
      type: Number,
    },
    expense_ratio: {
      type: mongoose.Schema.Types.Decimal128,
    },
    total_assets: {
      type: Number,
    },
    dividend_yield: {
      type: Number,
    },
    fund_type: {
      type: String,
    },
    investment_amount: {
      type: String,
    },
    investment_type: {
      type: String, // Type of investment (e.g., stock, mutual fund, gold, etc.)
      required: true,
    },
    investment_date: {
      type: Date, // Date when the investment was made
      required: true,
    },
    current_value: {
      type: Number, // Current value of the investment
    },
    returns: {
      type: Number, // Profit or loss (can be calculated as current_value - investment_amount)
    },
    sector: {
      type: String, // Sector of the investment (e.g., Technology, Healthcare)
    },
    // Fields specific to Stock
    company_name: {
      type: String,
    },
    // Fields specific to SIP
    sip_frequency: {
      type: String,
    },
    sip_amount: {
      type: Number,
    },
    sip_start_date: {
      type: Date,
    },
    sip_end_date: {
      type: Date,
    },
    // Fields specific to Fixed Deposit
    interest_rate: {
      type: Number,
    },
    tenure: {
      type: String,
    },
    maturity_date: {
      type: Date,
    },
    // Fields specific to Gold
    gold_purity: {
      type: String,
    },
    gold_weight: {
      type: String,
    },
    // Fields specific to PPF
    ppf_interest_rate: {
      type: Number,
    },
    ppf_tenure: {
      type: String,
    },
    ppf_maturity_date: {
      type: Date,
    },
    // Transactions array (optional and context-specific)
    transactions: [
      {
        date: { type: Date }, // Date of the transaction
        type: { type: String }, // Type of transaction (e.g., buy, sell)
        amount: { type: Number }, // Amount of the transaction
      },
    ],
  },
  { timestamps: true }
);

// Create the model
const InvestmentDetail = mongoose.model(
  "InvestmentDetail",
  InvestmentDetailSchema
);

module.exports = InvestmentDetail;
