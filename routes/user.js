const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const userMiddleware = require("../middleware/user");
const makeRequest = require("../middleware/makeRequest");

router.post("/register", makeRequest, userController.register);

router.post("/login", makeRequest, userController.login);

router.get("/verify_token", makeRequest, userMiddleware, userController.verify);

router.get(
  "/stock/dropdown",
  makeRequest,
  userMiddleware,
  userController.getStocksDropDown
);

router.get("/dashboard",
  makeRequest,
  userMiddleware,
  userController.userDashboard
)

module.exports = router;
