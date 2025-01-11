const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  if (!token) {
    throw new Error("No token, authorization denied");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Return the decoded token
  } catch (err) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  verifyToken,
};
