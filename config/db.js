const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const PASSWORD = process.env.MONGO_PWD;
// const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${PASSWORD}@intellivest.ba9ig.mongodb.net/?retryWrites=true&w=majority&appName=IntelliVest`;


console.log(MONGO_URL, "MONGO_URL");

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect DB...");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
exports.mongoose;