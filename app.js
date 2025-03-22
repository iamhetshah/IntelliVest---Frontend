const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helper = require('./helpers/index')
require('./config/db')
const yahooFinance = require("yahoo-finance2").default;
const originalStock = require("../api/models/originalStocks")
// Connect DB
mongoose.Promise = global.Promise;

var cors = require("cors");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Routes
const userRoutes = require('./routes/user')

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
  GOLD:'GC=F'
});
app.get("/stock/:name", async (req, res) => {
  try {
    const stockKey = req.params.name.toUpperCase(); // Convert to uppercase for match
    const symbol = IndianStocks[stockKey]; // Get the corresponding symbol

    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Invalid stock name. Use a valid key from the list." });
    }

    const stockData = await yahooFinance.quoteSummary(symbol, {
      modules: ["price"],
    });

    if (!stockData || !stockData.price) {
      return res.status(404).json({ error: "Stock data not found" });
    }

    const data = originalStock({
      name: stockKey,
      price: stockData.price.regularMarketPrice,
    });

    await data.save()

    res.json({
      symbol: stockData.price.symbol,
      currentPrice: stockData.price.regularMarketPrice,
      currency: stockData.price.currency,
      marketState: stockData.price.marketState,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to retrieve stock data" });
  }
});


// API End Point
app.use('/api',userRoutes)

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



module.exports = app