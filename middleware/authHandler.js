const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Getting token from header authorization in form of Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Getting token from cookies
  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Unauthorized to access this route.", 401));
  }

  try {
    // Make sure token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log token decoded value for dev
    console.log(decoded);

    // Get user
    req.user = await User.findOne({ _id: decoded.id });

    // continue
    next();
  } catch (error) {
    return next(new ErrorResponse("Unauthorized to access this route.", 401));
  }
});
