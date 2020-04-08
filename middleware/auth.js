const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // If no token
  if (!token) {
    res.status(401).json({ msg: "No token, authorization denied!" });
  }
  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"))
    // Assign the payload to the req.user
    //console.log(decoded);
    req.user = decoded.user;

    next();
  } catch (error) {
    res.status(401).json({msg: "Token not valid" });
  }
};
