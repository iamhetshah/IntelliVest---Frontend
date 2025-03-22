const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const userMiddleware = require("../middleware/user");
const makeRequest = require("../middleware/makeRequest");

router.post("/register", makeRequest, userController.register);

router.post("/login", makeRequest, userController.login);

router.get("/verify_token", makeRequest, userMiddleware, userController.verify);



module.exports = router;
