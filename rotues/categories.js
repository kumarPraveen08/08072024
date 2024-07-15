const express = require("express");

const { protect } = require("../middleware/authHandler");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  categoryPhotoUpload,
} = require("../controllers/categoryController");

const advancedResults = require("../middleware/advancedResults");
const Category = require("../models/CategoryModel");

const router = express.Router();

router
  .route("/")
  .get(advancedResults(Category), getCategories)
  .post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);
router.route("/:id/photo").put(categoryPhotoUpload);

module.exports = router;
