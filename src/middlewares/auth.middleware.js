const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookie.token;
  if (!token) return res.status(401).json({ msg: "Not logged in" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Only Admin access" });
  }
  next();
};
