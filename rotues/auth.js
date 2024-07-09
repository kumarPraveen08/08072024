const express = require("express");
const { register, login, getMe } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
// router.post("/forgetpassword", getMe);
// router.put("/resetpassword", getMe);
// router.post("/verify/:email", getMe);

module.exports = router;
