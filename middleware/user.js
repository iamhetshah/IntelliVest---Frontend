const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Ensure the Authorization header exists and contains a Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication failed. Token missing or invalid.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const { id } = decoded;

    const userData = await UserModel.findById(id);

    if (!userData) {
      return res.status(401).json({
        message: "Authentication failed. User not authorized.",
      });
    }

    req.userData = userData;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentication failed. Please try again.",
    });
  }
};