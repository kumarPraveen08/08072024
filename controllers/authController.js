const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/UserModel");

// @desc        Register new user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });

  res.status(200).json({ success: true, data: user });
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, route: "login route" });
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
