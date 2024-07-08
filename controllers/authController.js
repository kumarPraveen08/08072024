// @desc        Register new user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = async (req, res, next) => {
  res.status(200).json({ success: true, route: "register route" });
};

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = async (req, res, next) => {
  res.status(200).json({ success: true, route: "login route" });
};

// @desc        Get profile details
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = async (req, res, next) => {
  res.status(200).json({ success: true, route: "get profile details route" });
};
