const { verifyToken } = require("../utils");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token
    console.log({ token });

    req.user = verifyToken(token); // Attach decoded user to request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: err.message });
  }
};

const authSocketMiddleware = (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1]; // Extract token
    console.log({ token });

    socket.user = verifyToken(token); // Attach decoded user to socket
    next(); // Proceed to the next middleware
  } catch (err) {
    const error = new Error(err.message);
    error.data = { status: 401 }; // Custom error data
    next(error); // Pass error to the next middleware
  }
};

module.exports = { authMiddleware, authSocketMiddleware };
