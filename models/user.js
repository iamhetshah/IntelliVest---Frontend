const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
        required: true,
      unique:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    invested_apps: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(aggregatePaginate);

const User = mongoose.model("User", UserSchema);
module.exports = User;
