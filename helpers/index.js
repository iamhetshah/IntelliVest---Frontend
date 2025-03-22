const fs = require("fs");
const moment = require("moment");
const path = require("path");
const logFolder = "./Logs/Error_log";


exports.writeErrorLog = async (req, error) => {
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
  const requestHeaders = JSON.stringify(req.headers);
  const date = moment().format("MMMM Do YYYY, h:mm:ss a");
  const file_date = moment().format("DDMMYYYY");

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
    "\n" +
    "API Headers : " +
    requestHeaders +
    "\n" +
    "Error : " +
    error +
    "\n\n";

  // Append log entry to the file within the log folder
  const logFilePath = path.join(logFolder, `${file_date}_request.log`);
  fs.appendFileSync(logFilePath, logEntry);
};