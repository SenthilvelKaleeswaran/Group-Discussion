const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token
  console.log({aaaaaaa : token})

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, value] = cookie.split('=').map((part) => part.trim());
      return [key, value];
    })
  );
};

const authenticateWebSocket = (request, callback) => {
  const protocols = request.headers["sec-websocket-protocol"].split(",");
  const authToken = protocols.find((protocol) => protocol.startsWith("auth-"));


  if (!authToken) {
    return callback(false, 401, "Unauthorized: No token provided");
  }

  const token = authToken.split("auth-")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log({decoded})
    request.user = decoded; 
    callback(true);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    callback(false, 401, `Unauthorized: ${err.message}`);
  }
};


module.exports = { authMiddleware, authenticateWebSocket };
