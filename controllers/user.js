const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const niv = require("node-input-validator");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const helper = require('../helpers/index')

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

    const { first_name, last_name, password, email,username, invested_apps } = req.body;

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
      username:username
    });

    if (user) {
      const result = await user.save();
      let data
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
        data:data
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
        message:"You have verifed successfully."
      })
  } catch (error) {
    next(error)
  }
}