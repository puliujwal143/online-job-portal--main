const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Firebase User model

// =========================
// PROTECT ROUTES
// =========================
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1️⃣ Extract token
      token = req.headers.authorization.split(" ")[1];

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Fetch user from Firestore
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 4️⃣ Attach user to request (password already excluded)
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// =========================
// ROLE AUTHORIZATION
// =========================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// =========================
// EMPLOYER APPROVAL CHECK
// =========================
const checkApproval = (req, res, next) => {
  if (req.user.role === "employer" && !req.user.isApproved) {
    return res.status(403).json({
      message: "Your account is pending approval by admin",
    });
  }
  next();
};

module.exports = { protect, authorize, checkApproval };