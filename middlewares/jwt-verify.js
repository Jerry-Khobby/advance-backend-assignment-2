const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blackList");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "unauthorised: No token provided" });
  }

  // Split the token into "Bearer" and the actual token
  const tokenParts = token.split(" ");
  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    return res
      .status(401)
      .json({ error: "Unauthorised: Invalid token format" });
  }

  const actualToken = tokenParts[1]; // Extract the token part

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await Blacklist.findOne({ token: actualToken });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token has been invalidated" });
    }

    // Verify the token
    const decoded = jwt.verify(
      actualToken,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; // Attach the user object to request
    req.userId = decoded.id; // Add user ID to request object
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token verification failed" });
  }
};

module.exports = verifyToken;
