const express = require("express");
const {
  register,
  login,
  getMe,
  getUsers,
  getUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authHandler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, getUsers);
router.route("/users/:id").get(protect, getUser);
// router.post("/verify/:email", getMe);

module.exports = router;
