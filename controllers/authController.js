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

  // Create token
  const token = user.getSignedJwtToken();

  // response
  res.status(200).json({ success: true, token });
});

// @desc        Get profile details
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, route: "get profile details route" });
});

// @desc        Get all users
// @route       GET /api/v1/auth/users
// @access      Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc        Get a user by Id
// @route       GET /api/v1/auth/users/:id
// @access      Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`Resource not found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: user });
});
