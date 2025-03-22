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
const OriginalModel = require('../models/originalStocks')

const PPFModel = require("../models/ppf");
// const MutualFundModel = require("../models/mutualFunds");

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
exports.userDashboard = async (req, res, next) => {
  try {
    const userId = req.userData._id;

    // Fetch all investments
    const fixedDeposits = await FixedDepositModel.find({ userId });
    const goldInvestments = await GoldModel.find({ userId });
    const ppfInvestments = await PPFModel.find({ userId });
    const stocks = await StockModel.find({ userId });

    let totalPortfolioValue = 0;
    let totalReturns = 0;
    let totalInterestEarned = 0;
    let totalProfitLoss = 0;
    let totalInvested = 0
    // let totalTaxImpact = 0;

    // Calculate Stock Values
    stocks.forEach((stock) => {
      const currentValue = parseFloat(stock.selling_price) * stock.quantity;
      const profitLoss =
        (parseFloat(stock.selling_price) - parseFloat(stock.buying_price)) *
        stock.quantity;
      const invested = parseFloat(stock.buying_price) * stock.quantity;

      totalPortfolioValue += currentValue;
      totalProfitLoss += profitLoss;
      totalInvested += invested; // Add to total invested
    });

    // Calculate for gold
    const currentGoldPricePerGram = 6000; // Example price
    goldInvestments.forEach((gold) => {
      const currentValue = parseFloat(gold.quantity) * currentGoldPricePerGram;
      const investAmountPerGram =
        parseFloat(gold.investAmount) / parseFloat(gold.quantity);
      const profitLoss =
        (currentGoldPricePerGram - investAmountPerGram) *
        parseFloat(gold.quantity);
      const invested = parseFloat(gold.investAmount);

      totalPortfolioValue += currentValue;
      totalProfitLoss += profitLoss;
      totalInvested += invested; // Add to total invested
    });


    // Calculate Fixed Deposit Values
    fixedDeposits.forEach((fd) => {
      const tenureYears = fd.tenure / 12;
      const principal = parseFloat(fd.investAmount);
      console.log("principal :: " + principal);
      const interestRate = parseFloat(fd.interestRate);
      console.log("interestRate :: " + interestRate);


      // Correct interest earned using simple interest formula
      const interestEarned = (principal * interestRate * tenureYears) / 100;
      console.log("interestEarned :: " + interestEarned);
      

      // Calculate current value
      const currentValue = principal + interestEarned;
      console.log("currentValue :: " + currentValue);


      // Calculate returns percentage
      const returnsPercentage = ((currentValue - principal) / principal) * 100;
      console.log("returnsPercentage :: " + returnsPercentage);


      totalPortfolioValue += currentValue;
      totalInterestEarned += interestEarned;
      totalReturns += returnsPercentage;
    });


    // // Calculate Gold Investment Values (Assuming current gold price per gram is fetched from an external API)

    // // Calculate PPF Values using Compound Interest Formula
    ppfInvestments.forEach((ppf) => {
      const n = ppf.frequency === "yearly" ? 1 : 12;
      const t =
        (new Date(ppf.maturityDate) - new Date()) / (1000 * 60 * 60 * 24 * 365);
      const A =
        parseFloat(ppf.investAmount) *
        Math.pow(1 + parseFloat(ppf.interestRate) / n / 100, n * t);
      const interestEarned = A - parseFloat(ppf.investAmount);
      const returnsPercentage =
        ((A - parseFloat(ppf.investAmount)) / parseFloat(ppf.investAmount)) *
        100;
      
      console.log("returnsPercentage :: " + returnsPercentage);

      totalPortfolioValue += A;
      totalInterestEarned += interestEarned;
      totalReturns += returnsPercentage;
    });

    totalReturns = (totalProfitLoss / totalInvested) * 100;

     return res.status(200).json({
       message: "User Portfolio Summary",
       result: {
         totalPortfolioValue,
         totalReturns,
         totalInterestEarned,
         totalProfitLoss,
        //  totalTaxImpact,
       },
     });
    
  
  } catch (error) {
    next(error);
  }
};

// 67df1293b1106f1807ea89c0

// User Listing
exports.userInvestment = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const userId = req.userData._id;
    const option = {
      limit: parseInt(limit),
      page: parseInt(page),
    };
    const data = UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "fixeddeposits",
          localField: "_id",
          foreignField: "userId",
          as: "fixedDepositsData",
        },
      },
      {
        $unwind: {
          path: "$fixedDepositsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "goldinvestments",
          localField: "_id",
          foreignField: "userId",
          as: "goldInvestmentsData",
        },
      },
      {
        $unwind: {
          path: "$goldInvestmentsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "mutualfunds",
          localField: "_id",
          foreignField: "userId",
          as: "mutualFundsData",
        },
      },
      {
        $unwind: {
          path: "$mutualFundsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ppfs",
          localField: "_id",
          foreignField: "userId",
          as: "ppfsData",
        },
      },
      {
        $unwind: {
          path: "$ppfsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "userId",
          as: "stocksData",
        },
      },
      {
        $unwind: {
          path: "$stocksData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const result = await UserModel.aggregatePaginate;
    data, option;

    res.status(200).json({
      message: "Ok",
      result: result,
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
          price:1
        }
      }
    ])

    if (data.length === 0) {
      return res.status(200).json({
        message: "Ok",
        result:[]
      })
    }

    return res.status(200).json({
      message: "Ok",
      result:data
    })

  } catch (error) {
    next(error)
  }
}


exports.addInvestmentStock = async (req, res, next) => {
  try {

  } catch (error) {
    next(error)
  }
}