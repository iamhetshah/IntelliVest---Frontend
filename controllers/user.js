const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const niv = require("node-input-validator");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const helper = require("../helpers/index");
const FixedDepositModel = require("../models/fixedDeposit");
const GoldModel = require("../models/gold");
const StockModel = require("../models/stocks");
const OriginalModel = require("../models/originalStocks");

const PPFModel = require("../models/ppf");
const MutualFundModel = require("../models/mutualFunds");

// User Register
exports.register = async (req, res, next) => {
  try {
    const objValidation = new niv.Validator(req.body, {
      first_name: "required",
      last_name: "required",
      username: "required",
      password: "required|minLength:6",
      email: "required|email",
    });
    const matched = await objValidation.check();

    if (!matched) {
      return res.status(422).send({
        message: "Validation error",
        errors: objValidation.errors,
      });
    }

    const { first_name, last_name, password, email, username, invested_apps } =
      req.body;

    const existingUser = await UserModel.findOne({
      $or: [
        {
          $expr: { $eq: [{ $toLower: "$email" }, email.trim().toLowerCase()] },
        },
        { username: username.trim() },
      ],
    });

    if (existingUser) {
      const errorMessage =
        existingUser.email.toLowerCase() === email.trim().toLowerCase()
          ? "Email already exists!"
          : "Username already exists!";
      return res.status(409).json({ message: errorMessage });
    }
    const hash_password = await bcrypt.hash(password, 10);

    const user = await new UserModel({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hash_password,
      invested_apps: invested_apps,
      username: username,
    });

    if (user) {
      const result = await user.save();
      let data;
      if (invested_apps.length > 0) {
        data = await helper.userInvestmentData(user, invested_apps);
      }
      const token = jwt.sign(
        {
          email: result.email,
          id: result._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "2d",
        }
      );
      return res.status(201).json({
        message: "Registration Successful! Welcome aboard.",
        token: token,
        data: data,
      });
    }
  } catch (error) {
    next(error);
  }
};

// User Login
exports.login = async (req, res, next) => {
  try {
    const objValidation = new niv.Validator(req.body, {
      username: "required",
      password: "required",
    });

    const matched = await objValidation.check();

    if (!matched) {
      return res
        .status(422)
        .send({ message: "Validation error", errors: objValidation.errors });
    }

    const { username, password } = req.body;

    // Check if it's an email using node-input-validator
    const emailValidator = new niv.Validator(
      { email: username },
      { email: "email" }
    );
    const isEmail = await emailValidator.check();

    const query = isEmail
      ? { email: username.trim() }
      : { username: username.trim() };

    let user_data = await UserModel.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          email: 1,
          username: 1,
          password: 1,
          _id: 1,
        },
      },
    ]);

    let user = user_data[0];

    if (!user) {
      return res.status(409).json({
        message: "Invalid username, email, or password!",
      });
    }

    const passwordResult = await bcrypt.compare(password, user.password);

    if (!passwordResult) {
      return res.status(409).json({
        message: "Invalid username, email, or password",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "2d",
      }
    );

    return res.status(200).json({
      message: "You have logged in successfully.",
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

// User Verify
exports.verify = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: "You have verifed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// User Dashboard
// exports.userDashboard = async (req, res, next) => {
//   try {
//     const userId = req.userData._id;

//     // Fetch all investments
//     const fixedDeposits = await FixedDepositModel.find({ userId });
//     const goldInvestments = await GoldModel.find({ userId });
//     const ppfInvestments = await PPFModel.find({ userId });
//     const stocks = await StockModel.find({ userId });

//     let totalPortfolioValue = 0;
//     let totalReturns = 0;
//     let totalInterestEarned = 0;
//     let totalProfitLoss = 0;
//     let totalInvested = 0
//     // let totalTaxImpact = 0;

//     // Calculate Stock Values
//     stocks.forEach((stock) => {
//       const currentValue = parseFloat(stock.selling_price) * stock.quantity;
//       const profitLoss =
//         (parseFloat(stock.selling_price) - parseFloat(stock.buying_price)) *
//         stock.quantity;
//       const invested = parseFloat(stock.buying_price) * stock.quantity;

//       totalPortfolioValue += currentValue;
//       totalProfitLoss += profitLoss;
//       totalInvested += invested; // Add to total invested
//     });

//     // Calculate for gold
//     const currentGoldPricePerGram = 6000; // Example price
//     goldInvestments.forEach((gold) => {
//       const currentValue = parseFloat(gold.quantity) * currentGoldPricePerGram;
//       const investAmountPerGram =
//         parseFloat(gold.investAmount) / parseFloat(gold.quantity);
//       const profitLoss =
//         (currentGoldPricePerGram - investAmountPerGram) *
//         parseFloat(gold.quantity);
//       const invested = parseFloat(gold.investAmount);

//       totalPortfolioValue += currentValue;
//       totalProfitLoss += profitLoss;
//       totalInvested += invested; // Add to total invested
//     });

//     // Calculate Fixed Deposit Values
//     fixedDeposits.forEach((fd) => {
//       const tenureYears = fd.tenure / 12;
//       const principal = parseFloat(fd.investAmount);
//       console.log("principal :: " + principal);
//       const interestRate = parseFloat(fd.interestRate);
//       console.log("interestRate :: " + interestRate);

//       // Correct interest earned using simple interest formula
//       const interestEarned = (principal * interestRate * tenureYears) / 100;
//       console.log("interestEarned :: " + interestEarned);

//       // Calculate current value
//       const currentValue = principal + interestEarned;
//       console.log("currentValue :: " + currentValue);

//       // Calculate returns percentage
//       const returnsPercentage = ((currentValue - principal) / principal) * 100;
//       console.log("returnsPercentage :: " + returnsPercentage);

//       totalPortfolioValue += currentValue;
//       totalInterestEarned += interestEarned;
//       totalReturns += returnsPercentage;
//     });

//     // // Calculate Gold Investment Values (Assuming current gold price per gram is fetched from an external API)

//     // // Calculate PPF Values using Compound Interest Formula
//     ppfInvestments.forEach((ppf) => {
//       const n = ppf.frequency === "yearly" ? 1 : 12;
//       const t =
//         (new Date(ppf.maturityDate) - new Date()) / (1000 * 60 * 60 * 24 * 365);
//       const A =
//         parseFloat(ppf.investAmount) *
//         Math.pow(1 + parseFloat(ppf.interestRate) / n / 100, n * t);
//       const interestEarned = A - parseFloat(ppf.investAmount);
//       const returnsPercentage =
//         ((A - parseFloat(ppf.investAmount)) / parseFloat(ppf.investAmount)) *
//         100;

//       console.log("returnsPercentage :: " + returnsPercentage);

//       totalPortfolioValue += A;
//       totalInterestEarned += interestEarned;
//       totalReturns += returnsPercentage;
//     });

//     totalReturns = (totalProfitLoss / totalInvested) * 100;

//      return res.status(200).json({
//        message: "User Portfolio Summary",
//        result: {
//          totalPortfolioValue,
//          totalReturns,
//          totalInterestEarned,
//          totalProfitLoss,
//         //  totalTaxImpact,
//        },
//      });

//   } catch (error) {
//     next(error);
//   }
// };

const axios = require("axios");
// const MutualFund = require("../models/mutualFunds");

// User Dahboard
// exports.userDashboard = async (req, res, next) => {
//   try {
//     const userId = req.userData._id;

//     // Fetch all investments
//     const [fixedDeposits, goldInvestments, ppfInvestments, stocks] =
//       await Promise.all([
//         FixedDepositModel.find({ userId }),
//         GoldModel.find({ userId }),
//         PPFModel.find({ userId }),
//         StockModel.find({ userId }),
//       ]);

//     let totalPortfolioValue = 0;
//     let totalInterestEarned = 0;
//     let totalProfitLoss = 0;
//     let totalInvested = 0;

//     // Calculate Stock Values
//     stocks.forEach((stock) => {
//       const currentValue = parseFloat(stock.selling_price) * stock.quantity;
//       const profitLoss =
//         (parseFloat(stock.selling_price) - parseFloat(stock.buying_price)) *
//         stock.quantity;
//       const invested = parseFloat(stock.buying_price) * stock.quantity;

//       totalPortfolioValue += currentValue;
//       totalProfitLoss += profitLoss;
//       totalInvested += invested;
//     });

//     // Fetch current gold price from an external API
//     const currentGoldPricePerGram = 6000;

//     // Calculate Gold Investment Values
//     goldInvestments.forEach((gold) => {
//       const currentValue = parseFloat(gold.quantity) * currentGoldPricePerGram;
//       const investAmountPerGram =
//         parseFloat(gold.investAmount) / parseFloat(gold.quantity);
//       const profitLoss =
//         (currentGoldPricePerGram - investAmountPerGram) *
//         parseFloat(gold.quantity);
//       const invested = parseFloat(gold.investAmount);

//       totalPortfolioValue += currentValue;
//       totalProfitLoss += profitLoss;
//       totalInvested += invested;
//     });

//     // Calculate Fixed Deposit Values using Simple Interest
//     fixedDeposits.forEach((fd) => {
//       const tenureYears = fd.tenure / 12;
//       const principal = parseFloat(fd.investAmount);
//       const interestRate = parseFloat(fd.interestRate);

//       const interestEarned = (principal * interestRate * tenureYears) / 100;
//       const currentValue = principal + interestEarned;

//       totalPortfolioValue += currentValue;
//       totalInterestEarned += interestEarned;
//     });

//     // Calculate PPF Values using Compound Interest
//     ppfInvestments.forEach((ppf) => {
//       const n = ppf.frequency === "yearly" ? 1 : 12;
//       const t =
//         (new Date(ppf.maturityDate) - new Date()) / (1000 * 60 * 60 * 24 * 365);
//       const A =
//         parseFloat(ppf.investAmount) *
//         Math.pow(1 + parseFloat(ppf.interestRate) / n / 100, n * t);
//       const interestEarned = A - parseFloat(ppf.investAmount);

//       totalPortfolioValue += A;
//       totalInterestEarned += interestEarned;
//     });

//     // Calculate Total Returns as a weighted average
//     const totalReturns =
//       ((totalPortfolioValue - totalInvested) / totalInvested) * 100;

//     return res.status(200).json({
//       message: "User Portfolio Summary",
//       result: {
//         totalPortfolioValue: parseFloat(
//           parseFloat(totalPortfolioValue).toFixed(2)
//         ),
//         totalReturns: parseFloat(parseFloat(totalReturns).toFixed(2)),
//         totalInterestEarned: parseFloat(
//           parseFloat(totalInterestEarned).toFixed(2)
//         ),
//         totalProfitLoss: parseFloat(parseFloat(totalProfitLoss).toFixed(2)),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.userDashboard = async (req, res, next) => {
  try {
    const userId = req.userData._id;

    // Fetch all investments in parallel
    const [fixedDeposits, goldInvestments, ppfInvestments, stocks] =
      await Promise.all([
        FixedDepositModel.find({ userId }),
        GoldModel.find({ userId }),
        PPFModel.find({ userId }),
        StockModel.find({ userId }),
      ]);

    let totalPortfolioValue = 0;
    let totalInterestEarned = 0;
    let totalProfitLoss = 0;
    let totalInvested = 0;

    // Fetch current gold price from an external API (Static for now)
    const currentGoldPricePerGram = 6000;

    // Fetch current stock prices from the /api/stock/dropdown endpoint
    let stockPrices = {};
    try {
      const response = await axios.get(
        "http://localhost:3000/api/stock/dropdown"
      ); // Replace with your server URL
      response.data.result.forEach((stock) => {
        if (stock.price !== "N/A") {
          stockPrices[stock.symbol] = stock.price;
        }
      });
    } catch (error) {
      console.error("Failed to fetch stock prices:", error.message);
      // Fallback to static prices if the API fails
      stockPrices = {
        RELIANCE: 1276.35,
        TCS: 3578.1,
        HDFC_BANK: 1770.35,
        ICICI_BANK: 1343.1,
        HUL: 2246.2,
        SBI: 753.2,
        BAJAJ_FINANCE: 8916.1,
        MARUTI: 11732.8,
        LARSEN_TUBRO: 3415.95,
      };
    }

    // Calculate Stock Values
    for (const stock of stocks) {
      const buyingPrice = parseFloat(stock.buying_price);
      const quantity = stock.quantity;
      const invested = buyingPrice * quantity;

      let currentValue;
      if (stock.status === "CLOSED") {
        currentValue = parseFloat(stock.selling_price) * quantity;
      } else {
        // For LIVE and PENDING stocks, use current market price
        const currentPrice = stockPrices[stock.stock_name] || 0; // Use fetched price or 0 if not available
        currentValue = currentPrice * quantity;
      }

      const profitLoss = currentValue - invested;

      totalPortfolioValue += currentValue;
      totalProfitLoss += profitLoss;
      totalInvested += invested;
    }

    // Calculate Gold Investment Values
    for (const gold of goldInvestments) {
      const quantity = parseFloat(gold.quantity);
      const investAmount = parseFloat(gold.investAmount);
      const investAmountPerGram = investAmount / quantity;

      const currentValue = quantity * currentGoldPricePerGram;
      const profitLoss = currentValue - investAmount;

      totalPortfolioValue += currentValue;
      totalProfitLoss += profitLoss;
      totalInvested += investAmount;
    }

    // Calculate Fixed Deposit Values using Simple Interest
    for (const fd of fixedDeposits) {
      const principal = parseFloat(fd.investAmount);
      const interestRate = parseFloat(fd.interestRate);
      const tenureYears = fd.tenure / 12; // Assuming tenure is in months

      const interestEarned = (principal * interestRate * tenureYears) / 100;
      const currentValue = principal + interestEarned;

      totalPortfolioValue += currentValue;
      totalInterestEarned += interestEarned;
      totalInvested += principal;
    }

    // Calculate PPF Values using Compound Interest
    for (const ppf of ppfInvestments) {
      const principal = parseFloat(ppf.investAmount);
      const interestRate = parseFloat(ppf.interestRate);
      const maturityDate = new Date(ppf.maturityDate);
      const currentDate = new Date();
      const years = (maturityDate - currentDate) / (1000 * 60 * 60 * 24 * 365);

      const A = principal * Math.pow(1 + interestRate / 100, years);
      const interestEarned = A - principal;

      totalPortfolioValue += A;
      totalInterestEarned += interestEarned;
      totalInvested += principal;
    }

    // Calculate Total Returns
    const totalReturns =
      totalInvested > 0
        ? ((totalPortfolioValue - totalInvested) / totalInvested) * 100
        : 0;

    return res.status(200).json({
      message: "User Portfolio Summary",
      result: {
        totalPortfolioValue: +totalPortfolioValue.toFixed(2),
        totalReturns: +totalReturns.toFixed(2),
        totalInterestEarned: +totalInterestEarned.toFixed(2),
        totalProfitLoss: +totalProfitLoss.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

// User Listing
exports.userInvestment = async (req, res, next) => {
  try {
    const userId = req.userData._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch data from all collections
    const [fds, golds, mutualFunds, stocks, ppf] = await Promise.all([
      FixedDepositModel.find({ userId }).skip(skip).limit(limit),
      GoldModel.find({ userId }).skip(skip).limit(limit),
      MutualFundModel.find({ userId }).skip(skip).limit(limit),
      StockModel.find({ userId }).skip(skip).limit(limit),
      PPFModel.find({ userId }).skip(skip).limit(limit),
    ]);

    const investments = [];

    const formatNumber = (num) => parseFloat(parseFloat(num).toFixed(2));

    // Process Fixed Deposits
    fds.forEach((fd) => {
      investments.push({
        _id: fd._id,
        platform: fd.platform,
        type: "Fixed Deposit",
        amount: formatNumber(fd.investAmount),
        interestRate: formatNumber(fd.interestRate),
        tenure: fd.tenure,
        payoutOption: fd.payoutOption,
        status: fd.status,
      });
    });

    // Process Gold Investments
    golds.forEach((gold) => {
      investments.push({
        _id: gold._id,
        platform: gold.platform,
        type: gold.investType,
        amount: formatNumber(gold.investAmount),
        quantity: formatNumber(gold.quantity),
        lockInPeriod: gold.lockInPeriod || "-",
        status: gold.status,
      });
    });

    // Process Mutual Funds
    mutualFunds.forEach((fund) => {
      investments.push({
        _id: fund._id,
        platform: fund.platform,
        type: `${fund.fundType} Mutual Fund (${fund.investType})`,
        amount: formatNumber(fund.investAmount),
        riskProfile: fund.riskProfile,
        status: fund.status,
      });
    });

    // Process Stocks
    stocks.forEach((stock) => {
      investments.push({
        _id: stock._id,
        platform: stock.platform,
        type: "Stock",
        stockName: stock.stock_name,
        quantity: formatNumber(stock.quantity),
        buyingPrice: formatNumber(stock.buying_price),
        sellingPrice: formatNumber(stock.selling_price),
        stockTax: formatNumber(stock.stock_tax),
        amount: formatNumber(stock.buying_price * stock.quantity),
        status: stock.status,
      });
    });

    // Process PPF
    ppf.forEach((item) => {
      investments.push({
        _id: item._id,
        platform: item.platform,
        type: "PPF",
        amount: formatNumber(item.investAmount),
        frequency: item.frequency,
        interestRate: formatNumber(item.interestRate),
        maturityDate: item.maturityDate.toISOString().split("T")[0],
        status: item.status,
      });
    });

    return res.status(200).json({
      success: true,
      investments,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getStocksDropDown = async (req, res, next) => {
  try {
    const data = await OriginalModel.aggregate([
      {
        $project: {
          name: 1,
          _id: 1,
          price: 1,
        },
      },
    ]);

    if (data.length === 0) {
      return res.status(200).json({
        message: "Ok",
        result: [],
      });
    }

    return res.status(200).json({
      message: "Ok",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.addInvestmentStock = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

exports.pie = async (req, res, next) => {
  try {
    const userId = req.userData._id;

    // Fetch all investments for the user
    const [fds, stocks, mutualFunds, golds, ppfs] = await Promise.all([
      FixedDepositModel.find({ userId }),
      StockModel.find({ userId }),
      MutualFundModel.find({ userId }),
      GoldModel.find({ userId }),
      PPFModel.find({ userId }),
    ]);

    // Calculate total investment for each type
    const totalFixedDeposits = fds.reduce(
      (sum, fd) => sum + parseFloat(fd.investAmount),
      0
    );
    const totalStocks = stocks.reduce(
      (sum, stock) => sum + parseFloat(stock.buying_price) * stock.quantity,
      0
    );
    const totalMutualFunds = mutualFunds.reduce(
      (sum, fund) => sum + parseFloat(fund.investAmount),
      0
    );
    const totalGold = golds.reduce(
      (sum, gold) => sum + parseFloat(gold.investAmount),
      0
    );
    const totalPPF = ppfs.reduce(
      (sum, ppf) => sum + parseFloat(ppf.investAmount),
      0
    );

    // Prepare data for the pie chart
    const pieData = [
      { label: "Fixed Deposits", value: totalFixedDeposits },
      { label: "Stocks", value: totalStocks },
      { label: "Mutual Funds", value: totalMutualFunds },
      { label: "Gold", value: totalGold },
      { label: "PPF", value: totalPPF },
    ];

    // Filter out investment types with a total value of 0
    const filteredPieData = pieData.filter((item) => item.value > 0);

    // Return the data
    res.status(200).json({
      message: "OK",
      data: filteredPieData,
    });
  } catch (error) {
    console.error("Error in pie chart API:", error);
    next(error);
  }
};

exports.averageReturns = async (req, res, next) => {
  try {
    const fixedDeposits = await FixedDepositModel.find({
      userId: req.userData._id,
    });
    const goldInvestments = await GoldModel.find({ userId: req.userData._id });
    const mutualFunds = await MutualFundModel.find({
      userId: req.userData._id,
    });
    const ppfs = await PPFModel.find({ userId: req.userData._id });
    const stocks = await StockModel.find({ userId: req.userData._id });

    const averageReturns = [
      {
        label: "FixedDeposit",
        value: parseFloat(
          calculateAverage(
            fixedDeposits.map((fd) =>
              parseFloat(fd.interestRate?.toString() || "0")
            )
          ).toFixed(2)
        ),
      },
      {
        label: "GoldInvestment",
        value: parseFloat(
          calculateAverage(
            goldInvestments.map((gold) => {
              const buyingPrice = parseFloat(
                gold.investAmount?.toString() || "0"
              );
              if (buyingPrice <= 0) return 0;
              const sellingPrice = buyingPrice * 1.1; // Example: 10% appreciation
              return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
            })
          ).toFixed(2)
        ),
      },
      {
        label: "MutualFund",
        value: parseFloat(
          calculateAverage(
            mutualFunds.map((mf) => {
              const investAmount = parseFloat(
                mf.investAmount?.toString() || "0"
              );
              if (investAmount <= 0) return 0;
              const currentValue = investAmount * 1.12; // Example: 12% return
              return ((currentValue - investAmount) / investAmount) * 100;
            })
          ).toFixed(2)
        ),
      },
      {
        label: "PPF",
        value: parseFloat(
          calculateAverage(
            ppfs.map((ppf) => parseFloat(ppf.interestRate?.toString() || "0"))
          ).toFixed(2)
        ),
      },
      {
        label: "Stock",
        value: parseFloat(
          calculateAverage(
            stocks.map((stock) => {
              const buyingPrice = parseFloat(
                stock.buying_price?.toString() || "0"
              );
              const sellingPrice = parseFloat(
                stock.selling_price?.toString() || "0"
              );
              if (buyingPrice <= 0) return 0;
              return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
            })
          ).toFixed(2)
        ),
      },
    ];

    return res.status(200).json({
      message: "Ok",
      data: averageReturns,
    });
  } catch (error) {
    next(error);
  }
};

const calculateAverage = (values) => {
  if (values.length === 0) return 0;
  const validValues = values.filter((val) => !isNaN(val));
  if (validValues.length === 0) return 0;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
};

// Add Stocks
exports.addStock = async (req, res, next) => {
  try {
    const {
      stock_name,
      quantity,
      price,
      stock_type,
      platform = "Intellivest",
    } = req.body;
    const userId = req.userData._id;

    const stock = await StockModel({
      stock_name: stock_name,
      quantity: quantity,
      price: price,
      userId: userId,
      investment_type: "Stock",
      platform: platform,
      stock_type,
    });

    if (stock_type == "BUY") {
      stock.buying_price = price;
    }
    if (stock_type == "SELL") {
      stock.selling_price = price;
    }

    await stock.save();

    return res.status(200).json({
      message: `Stocks successfully ${stock_type}`,
    });
  } catch (error) {
    next(error);
  }
};

// Add Mutual Fund
exports.mutualStock = async (req, res, next) => {
  try {
    const objValidation = new niv.Validator(req.body, {
      investAmount: "min:1",
    });
    const matched = await objValidation.check();

    if (!matched) {
      return res.status(422).send({
        message: "Validation error",
        errors: objValidation.errors,
      });
    }

    const {
      fundType,
      investType,
      riskProfile,
      investAmount,
      platform = "Intellivest",
      investName,
    } = req.body;
    const userId = req.userData._id;

    const fund = await MutualFundModel({
      platform: platform,
      userId: userId,
      fundType: fundType,
      investType: investType,
      investAmount: investAmount,
      riskProfile: riskProfile,
      investName: investName,
    });

    await fund.save();

    return res.status(200).json({
      message: "Mutual Fund successfully inversted",
    });
  } catch (error) {
    next(error);
  }
};
