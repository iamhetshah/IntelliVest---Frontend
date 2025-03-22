const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require("mongoose-paginate-v2");

const InvestmentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

InvestmentSchema.plugin(mongoosePaginate);
InvestmentSchema.plugin(aggregatePaginate);

const Investment = mongoose.model("Investment", InvestmentSchema);
module.exports = Investment;
