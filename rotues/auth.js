const express = require("express");
const {
  register,
  login,
  getMe,
  getUsers,
  getUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
// router.post("/verify/:email", getMe);

module.exports = router;
