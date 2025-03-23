const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helper = require("./helpers/index");
require("./config/db");
const yahooFinance = require("yahoo-finance2").default;
// const originalStock = require("../api/models/originalStocks");

// Connect DB
mongoose.Promise = global.Promise;

var cors = require("cors");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Routes
const userRoutes = require("./routes/user");
const llmRoutes = require("./routes/llm");

const IndianStocks = Object.freeze({
  RELIANCE: "RELIANCE.NS",
  TCS: "TCS.NS",
  INFY: "INFY.NS",
  HDFC_BANK: "HDFCBANK.NS",
  ICICI_BANK: "ICICIBANK.NS",
  HUL: "HINDUNILVR.NS",
  SBI: "SBIN.NS",
  BAJAJ_FINANCE: "BAJFINANCE.NS",
  MARUTI: "MARUTI.NS",
  LARSEN_TUBRO: "LT.NS",
  TSLA: "TSLA",
  CRUDE: "CL=F",
});

app.get("/api/stock/dropdown", async (req, res) => {
  try {
    const stockSymbols = Object.values(IndianStocks);
    const stockData = await Promise.all(
      stockSymbols.map(async (symbol) => {
        try {
          const data = await yahooFinance.quoteSummary(symbol, {
            modules: ["price"],
          });
          return {
            name: symbol,
            price: data?.price?.regularMarketPrice || "N/A",
          };
        } catch (err) {
          console.error(`Failed to fetch ${symbol}`, err.message);
          return { symbol, price: "N/A" };
        }
      })
    );

    return res.status(200).json({
      message: "Ok",
      result: stockData,
    });
  } catch (error) {
    console.error(
      "Error fetching stock data:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to retrieve stock data" });
  }
});

// API End Point
app.use("/api", userRoutes);
app.use("/api/v1", llmRoutes);

// cors middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/cancel", (req, res) => {
  console.log("cancel");
  console.log(req);
});

app.use("/success", (req, res) => {
  console.log("success");
  console.log(req);
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use(async (error, req, res, next) => {
  res.status(error.status || 500);
  if (error.status) {
    return res.json({
      message: error.message,
    });
  }
  await helper.writeErrorLog(req, error);
  return res.json({
    message: "Internal Server Error",
    error: error.message,
  });
});

module.exports = app;
