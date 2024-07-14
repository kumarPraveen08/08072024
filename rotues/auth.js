const express = require("express");
const { register, login, getMe, forgotPassword } = require("../controllers/authController");

const { protect } = require("../middleware/authHandler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);

module.exports = router;
