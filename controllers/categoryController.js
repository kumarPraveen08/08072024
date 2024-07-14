const path = require("path");
const Category = require("../models/CategoryModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc        Get all categories
// @route       GET /api/v1/categories
// @access      Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc        Get a category by Id
// @route       GET /api/v1/categories/:id
// @access      Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  // Get a category by id
  const category = await Category.findById(req.params.id);

  // Make sure category exists
  if (!category)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // response
  res.status(200).json({ success: true, data: category });
});

// @desc        Create new category
// @route       POST /api/v1/categories
// @access      Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Extract necessary data from request body
  const { name } = req.body;

  // Create a new category in the database
  let category = await Category.create({ name });

  // Respond with status 201 (Created) and JSON data of the created category
  res.status(201).json({ success: true, data: category });
});

// @desc        Update a category by Id
// @route       PUT /api/v1/categories/:id
// @access      Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  // Get category by id
  let category = await Category.findById(req.params.id);

  // Make sure category exists
  if (!category)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Update category
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // response
  res.status(200).json({ success: true, data: category });
});

// @desc        Delete a category by Id
// @route       DELETE /api/v1/categories/:id
// @access      Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // Get category by id
  let category = await Category.findById(req.params.id);

  // Make sure category exists
  if (!category) {
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );
  }

  // Remove category
  await category.deleteOne();

  // Respond with 204 No Content after successful deletion
  res.status(200).json({ success: true, data: {} });
});

// @desc        Upload photo for category
// @route       PUT /api/v1/categories/:id/photo
// @access      Private
exports.categoryPhotoUpload = asyncHandler(async (req, res, next) => {
  // Get category by id
  let category = await Category.findById(req.params.id);

  // Make sure category exists
  if (!category)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Uploaded File
  const file = req.files.file;

  // Make sure the file is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload a photo less than ${process.env.MAX_UPLOAD_SIZE}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `category_${req.params.id}${path.parse(file.name).ext}`;

  // Move file to static public folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add photo to store
    await Category.findByIdAndUpdate(req.params.id, { image: file.name });

    // Response
    res.status(200).json({ success: true, data: file.name });
  });
});
