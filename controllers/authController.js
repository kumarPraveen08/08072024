const crypto = require('crypto');
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/UserModel");
const sendEmail = require("../utils/sendEmail");

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


// @desc        Forget Password
// @route       POST /api/v1/auth/forgetPassword
// @access      Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Get user via id
  const user = await User.findOne({email : req.body.email});
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  // Generate reset token
  const resetToken = user.getResetPasswordToken();

  //await user.save({ resetToken });
  await user.save({ validateBeforesave : false });

  // Send email with reset token
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click on the following link to complete the process: \n\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email and your password will remain unchanged.`;

  try{
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message
    });

    res.status(200).json({ success: true, message: "Email sent" });
  }catch(error){
    console.error("Error sending email", error);

     user.forgotToken = undefined;
     user.forgotTokenExpire = undefined;
    await user.save({ validateBeforesave : false });

    return next(new ErrorResponse("Error sending email", 500));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc        Reset Password
// @route       POST /api/v1/auth/resetPassword/:resettoken
// @access      Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get user via reset token
  const resetPasswordToken = crypto
   .createHash("sha256")
   .update(req.params.resettoken)
   .digest("hex");


  const user = await User.findOne({
    forgotToken : resetPasswordToken,
    forgotTokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid token or token expired", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.forgotToken = undefined;
  user.forgotTokenExpire = undefined;
  await user.save();

  // Send welcome email
  const welcomeEmail = `Welcome to PriceTracker, ${user.name}! Your account has been successfully reset. You can now log in using your new password.`;

  try{
    await sendEmail( {
      email: user.email,
      subject: "Password Reset Successful",
      message: welcomeEmail
    });

    }catch(error){
    console.error("Error sending welcome email", error);
    return next(new ErrorResponse("Error sending welcome email", 500));
  }
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

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
