const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateDetails,
} = require("../controllers/authController");

const { protect } = require("../middleware/authHandler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);
router.put("/:id", protect, updateDetails);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resettoken", resetPassword);
router.put("/verify-account/:token", verifyEmail);

module.exports = router;
