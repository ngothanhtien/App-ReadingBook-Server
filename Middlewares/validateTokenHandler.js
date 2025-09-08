const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Token không hợp lệ hoặc hết hạn");
      }

      // Nếu bạn sign như { id, email } thì decoded chính là user info
      req.user = decoded;
      next();
    });
  } else {
    res.status(401);
    throw new Error("Không có token trong header");
  }
});

module.exports = validateToken;
