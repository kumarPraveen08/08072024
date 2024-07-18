const crypto = require("crypto");
const User = require("../models/UserModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const sendEmail = require("../utils/sendEmail");

// @desc        Register new user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  // Filter request body needed data
  const { name, email, password } = req.body;

  // Creating email reset token and email expire
  const hashedToken = crypto.randomBytes(20).toString("hex");
  const emailToken = crypto
    .createHash("sha256")
    .update(hashedToken)
    .digest("hex");
  const emailTokenExpire = Date.now() + 7 * 24 * 60 * 60 * 1000;

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    emailToken,
    emailTokenExpire,
  });

  // Create token
  const token = user.getSignedJwtToken();

  // Send email
  const verifyUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify-account/${emailToken}`;
  const message = `Thank you for signing up with us! To complete your registration, please verify your email address by clicking the link below:  \n\n<a href="${verifyUrl}" target="_blank">${verifyUrl}</a>\n\nThis link will expire in 1 hour.`;

  // Sending Email
  try {
    await sendEmail({
      email: email,
      subject: "Verify Your Account",
      message,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse(`Problem with sending email`, 500));
  }

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

// @desc        Update profile details by Id
// @route       PUT /api/v1/users/:id
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // Get user by id
  let user = await User.findById(req.params.id);

  // Make sure user exists
  if (!user)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Update user
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // response
  res.status(200).json({ success: true, data: user });
});

// @desc        Forget Password
// @route       POST /api/v1/auth/forget-password
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Get user via email
  const user = await User.findOne({ email: req.body.email });

  // Make sure user exists
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();

  // await user.save({ resetToken });
  await user.save({ validateBeforesave: false });

  // Send email with reset token
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click on the following link to complete the process: \n\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });
  } catch (error) {
    console.error("Error sending email", error);
    user.forgotToken = null;
    user.forgotTokenExpire = null;
    await user.save({ validateBeforesave: false });

    return next(new ErrorResponse("Problem with sending email", 500));
  }

  // Response
  res.status(200).json({ success: true, data: user });
});

// @desc        Reset Password
// @route       PUT /api/v1/auth/reset-password/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

  // Get user via reset token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Get user by forget password token and
  const user = await User.findOne({
    forgotToken: resetPasswordToken,
    forgotTokenExpire: { $gt: Date.now() },
  });

  // Make sure user exits
  if (!user) {
    return next(new ErrorResponse("Invalid token or token expired", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.forgotToken = null;
  user.forgotTokenExpire = null;
  await user.save();

  // Send welcome email
  const welcomeEmail = `Welcome to PriceTracker, ${user.name}! Your account has been successfully reset. You can now log in using your new password.`;

  // Sending email
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Successful",
      message: welcomeEmail,
    });
  } catch (error) {
    console.error("Error sending welcome email", error);
    return next(new ErrorResponse("Error sending welcome email", 500));
  }

  // Send token and response
  sendTokenResponse(user, 200, res);
});

// @desc        User Account Verification
// @route       PUT /api/v1/auth/verify-account/:token
// @access      Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  
  // Get user via reset token
  const user = await User.findOne({
    emailToken: req.params.token,
    emailTokenExpire: { $gt: Date.now() },
  });

  console.log(req.params.token);

  // Make sure user exits
  if (!user) {
    return next(new ErrorResponse("Invalid token or token expired", 400));
  }

  // Make user verified
  user.is_verified = true;
  user.emailToken = null;
  user.emailTokenExpire = null;

  // Save user
  await user.save();

  // Send welcome email
  const welcomeEmail = `Welcome to PriceTracker, ${user.name}! Your account has been successfully verified. You can now log in using your new password.`;

  // Sending email
  try {
    await sendEmail({
      email: user.email,
      subject: "Account Verified Successful",
      message: welcomeEmail,
    });
  } catch (error) {
    console.error("Error sending welcome email", error);
    return next(new ErrorResponse("Error sending welcome email", 500));
  }

  // Sending token in response
  sendTokenResponse(user, 200, res);
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

  // Send response
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
