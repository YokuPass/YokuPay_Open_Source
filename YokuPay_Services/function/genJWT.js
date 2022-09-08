require("dotenv").config();

const jwt = require("jsonwebtoken");

const gernerateJWT = async (data) => {
  const accessToken = jwt.sign(data, process.env.YOKU_TOKEN_SECRET, { expiresIn: '1h' }); //, { expiresIn: '150s' }

  return accessToken;
};

module.exports.gernerateJWT = gernerateJWT;
