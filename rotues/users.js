const express = require("express");

const { protect } = require("../middleware/authHandler");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const advancedResults = require("../middleware/advancedResults");
const User = require("../models/UserModel");

const router = express.Router();

router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
