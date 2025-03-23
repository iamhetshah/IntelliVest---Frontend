const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const userMiddleware = require("../middleware/user");
const makeRequest = require("../middleware/makeRequest");

router.post("/register", makeRequest, userController.register);

router.post("/login", makeRequest, userController.login);

router.get("/verify_token", makeRequest, userMiddleware, userController.verify);

router.post(
  "/add-mutual",
  makeRequest,
  userMiddleware,
  userController.mutualStock
);
// router.get(
//   "/stock/dropdown",
//   makeRequest,
//   userMiddleware,
//   userController.getStocksDropDown
// );

router.get(
  "/dashboard",
  makeRequest,
  userMiddleware,
  userController.userDashboard
);

router.get(
  "/user-investment",
  makeRequest,
  userMiddleware,
  userController.userInvestment
);

router.get("/pie-chart", makeRequest, userMiddleware, userController.pie);

router.get(
  "/bar-chart",
  makeRequest,
  userMiddleware,
  userController.averageReturns
);

router.post("/add-stock", makeRequest, userMiddleware, userController.addStock);
module.exports = router;
