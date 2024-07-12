const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/UserModel");

// @desc        Register new user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  // Filter request body needed data
  const { name, email, password } = req.body;

  // Create new user
  const user = await User.create({ name, email, password });

  // Create token
  const token = user.getSignedJwtToken();

  // response
  res.status(200).json({ success: true, token });
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  // Filter request body needed data
  const { email, password } = req.body;

  // fields are required
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Get user with email
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists
  if (!user) {
    return next(new ErrorResponse("Invaild Credentials", 401));
  }

  // If user exists check password is matched
  const isMatched = await user.matchPassword(password);

  // If password is not valid
  if (!isMatched) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Creating token and sending with cookie
  sendTokenResponse(user, 200, res);
});

// @desc        Get profile details via Token
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Get user via id
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // If api is in production then we want api to run https
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
