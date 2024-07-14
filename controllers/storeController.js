const path = require("path");
const Store = require("../models/StoreModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc        Get all stores
// @route       GET /api/v1/stores
// @access      Public
exports.getStores = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc        Get a store by Id
// @route       GET /api/v1/stores/:id
// @access      Public
exports.getStore = asyncHandler(async (req, res, next) => {
  // Get a store by id
  const store = await Store.findById(req.params.id);

  // Make sure store exists
  if (!store)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // response
  res.status(200).json({ success: true, data: store });
});

// @desc        Create new store
// @route       POST /api/v1/stores
// @access      Private
exports.createStore = asyncHandler(async (req, res, next) => {
  // Extract necessary data from request body
  const { name, is_searchable, search_url, search_seperator, domain } =
    req.body;

  // Create a new store in the database
  let store = await Store.create({
    name,
    is_searchable,
    search_url,
    search_seperator,
    domain,
  });

  // Respond with status 201 (Created) and JSON data of the created store
  res.status(201).json({ success: true, data: store });
});

// @desc        Update a store by Id
// @route       PUT /api/v1/stores/:id
// @access      Private
exports.updateStore = asyncHandler(async (req, res, next) => {
  // Get store by id
  let store = await Store.findById(req.params.id);

  // Make sure store exists
  if (!store)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Update store
  store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // response
  res.status(200).json({ success: true, data: store });
});

// @desc        Delete a store by Id
// @route       DELETE /api/v1/stores/:id
// @access      Private
exports.deleteStore = asyncHandler(async (req, res, next) => {
  // Get store by id
  let store = await Store.findById(req.params.id);

  // Make sure store exists
  if (!store) {
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );
  }

  // Remove store
  await store.deleteOne();

  // Respond with 204 No Content after successful deletion
  res.status(200).json({ success: true, data: {} });
});

// @desc        Upload photo for store
// @route       PUT /api/v1/stores/:id/photo/:type
// @access      Private
exports.storePhotoUpload = asyncHandler(async (req, res, next) => {
  // Get store by id
  let store = await Store.findById(req.params.id);

  // Make sure store exists
  if (!store)
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
  file.name = `${req.params.type}_${req.params.id}${path.parse(file.name).ext}`;

  // Move file to static public folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add photo to store
    await Store.findByIdAndUpdate(
      req.params.id,
      req.params.type === "logo"
        ? { image: file.name }
        : { prime_image: file.name }
    );

    // Response
    res.status(200).json({ success: true, data: file.name });
  });
});
