const fs = require("fs");
const moment = require("moment");
const path = require("path");
const logFolder = "./Logs/Request_log";

module.exports = async (req, res, next) => {
  try {
    try {
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
      }
    } catch (error) {
      console.log(error);
    }

    const requestURL = req.protocol + "://" + req.get("host") + req.originalUrl;
    const requestBody = JSON.stringify(req.body);
    const Method = req.method;
    const date = moment().format("MMMM Do YYYY, h:mm:ss a");
    const file_date = moment().format("DDMMYYYY");

    // Construct the log entry
    const logEntry =
      "REQUEST DATE : " +
      date +
      "\n" +
      "API URL : " +
      requestURL +
      "\n" +
      "API METHOD : " +
      Method +
      "\n" +
      "API PARAMETER : " +
      requestBody +
      "\n\n";

    // Append log entry to the file within the log folder
    const logFilePath = path.join(logFolder, `${file_date}_request.log`);
    fs.appendFileSync(logFilePath, logEntry);
    next();
  } catch (error) {
    next(error);
  }
};
