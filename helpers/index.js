const fs = require("fs");
const moment = require("moment");
const path = require("path");
const logFolder = "./Logs/Error_log";
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const StockModel = require("../models/stocks");
const FixedDepositModel = require("../models/fixedDeposit");
const GoldModel = require("../models/gold");
const PPFModel = require("../models/ppf");
const MutualFundModel = require("../models/mutualFunds");

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

exports.userInvestmentData = async (user, invested_apps) => {
  try {
    const mockData = invested_apps.flatMap((app) => {
      const platform = app; // e.g., angleOne, groww, etc.
      const investmentTypes = [
        "Stock",
        "Fixed Deposit",
        "Gold",
        "PPF",
        "Mutual Fund",
      ];
      const selectedTypes = faker.helpers.arrayElements(investmentTypes, 3);

      return selectedTypes
        .map((type) => generateMockData(type, platform, user, 1))
        .flat();
    });

    if (!mockData.length) {
      console.log("No mock data generated.");
      return [];
    }

    console.log("Generated Mock Data:", mockData);

    for (const data of mockData) {
      console.log(`Processing ${data.investment_type}`);
      switch (data.investment_type) {
        case "Stock":
          await StockModel.create(data);
          break;
        case "Fixed Deposit":
          await FixedDepositModel.create(data);
          break;
        case "Gold":
          await GoldModel.create(data);
          break;
        case "PPF":
          await PPFModel.create(data);
          break;
        case "Mutual Fund":
          await MutualFundModel.create(data);
          break;
        default:
          console.log("Unknown investment type:", data.investment_type);
      }
    }

    return mockData;
  } catch (error) {
    console.error("Error Occurred in userInvestmentData:", error.message);
    throw error;
  }
};



const generateMockData = (investmentType, platform, user, count = 1) => {
  const mockData = [];

  for (let i = 0; i < count; i++) {
    const baseData = {
      userId: user._id,
      platform,
      investment_type: investmentType,
    };

    switch (investmentType) {
      case "Stock":
        baseData.stock_name = faker.helpers.arrayElement([
          "RELIANCE",
          "TCS",
          "HDFC_BANK",
          "ICICI_BANK",
          "HUL",
          "SBI",
          "BAJAJ_FINANCE",
          "MARUTI",
          "LARSEN_TUBRO",
        ]);
        baseData.buying_price = faker.number.float({
          min: 100,
          max: 5000,
          precision: 0.01,
        });
        baseData.selling_price = faker.number.float({
          min: 100,
          max: 6000,
          precision: 0.01,
        });
        baseData.quantity = faker.number.int({ min: 1, max: 100 });
        baseData.stock_tax = faker.number.float({
          min: 1,
          max: 50,
          precision: 0.01,
        });
        baseData.pe_ratio = faker.number.float({
          min: 5,
          max: 50,
          precision: 0.01,
        });
        baseData.volume = faker.number.int({ min: 1000, max: 100000 });
        baseData.eps = faker.number.float({ min: 1, max: 20, precision: 0.01 });
        baseData.stock_type = faker.helpers.arrayElement(["BUY", "SELL"]);
        baseData.market_cap = faker.number.float({
          min: 500,
          max: 10000,
          precision: 0.01,
        });
        break;

      case "Fixed Deposit":
        baseData.investAmount = faker.number.float({
          min: 1000,
          max: 1000000,
          precision: 0.01,
        });
        baseData.tenure = faker.number.int({ min: 1, max: 120 });
        baseData.payoutOption = faker.helpers.arrayElement([
          "Monthly",
          "Quarterly",
          "Yearly",
          "On Maturity",
        ]);
        break;

      case "Gold":
        baseData.investType = faker.helpers.arrayElement([
          "Digital Gold",
          "EIF",
          "Sovereign Gold Bond",
        ]);
        baseData.investAmount = faker.number.float({
          min: 1,
          max: 1000000,
          precision: 0.01,
        });
        baseData.quantity = faker.number.float({
          min: 0.01,
          max: 1000,
          precision: 0.01,
        });
        baseData.lockInPeriod = faker.number.int({ min: 0, max: 120 });
        break;

      case "PPF":
        baseData.investAmount = faker.number.float({
          min: 500,
          max: 150000,
          precision: 0.01,
        });
        baseData.frequency = faker.helpers.arrayElement(["monthly", "yearly"]);
        baseData.interestRate = faker.number.float({
          min: 7,
          max: 8.5,
          precision: 0.01,
        });
        baseData.maturityDate = faker.date.future({ years: 15 });
        break;

      case "Mutual Fund":
        baseData.fundType = faker.helpers.arrayElement([
          "Equity",
          "Hybrid",
          "Index",
          "Debt",
        ]);
        baseData.investType = faker.helpers.arrayElement(["LUMP SUM", "SIP"]);
        baseData.investAmount = faker.number.float({
          min: 1000,
          max: 100000,
          precision: 0.01,
        });
        baseData.riskProfile = faker.helpers.arrayElement([
          "Low",
          "Medium",
          "High",
        ]);
        break;

      default:
        throw new Error(`Unsupported investment type: ${investmentType}`);
    }

    mockData.push(baseData);
  }

  return mockData;
};

