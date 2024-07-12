const User = require("../models/UserModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc        Get all users
// @route       GET /api/v1/users
// @access      Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  let reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and remove them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Finding resource
  query = User.find(JSON.parse(queryStr), {
    // _id: 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    console.log(fields);
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Creating pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Getting user according to query
  const users = await query;

  //   Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // response
  res
    .status(200)
    .json({ success: true, count: users.length, pagination, data: users });
});

// @desc        Get a user by Id
// @route       GET /api/v1/users/:id
// @access      Private
exports.getUser = asyncHandler(async (req, res, next) => {
  // Get a user by id
  const user = await User.findById(req.params.id);

  // Make sure user exists
  if (!user)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // response
  res.status(200).json({ success: true, data: user });
});

// @desc        Create new user
// @route       POST /api/v1/users
// @access      Private
exports.createUser = asyncHandler(async (req, res, next) => {
  // Extract necessary data from request body
  const { name, email, password } = req.body;

  // Create a new user in the database
  let user = await User.create({ name, email, password });

  // Generate JWT token for the user
  const token = user.getSignedJwtToken();

  // Respond with status 201 (Created) and JSON data of the created user including token
  res.status(201).json({ success: true, data: user, token });
});

// @desc        Update a user by Id
// @route       PUT /api/v1/users/:id
// @access      Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Get user by id
  let user = await User.findById(req.params.id);

  // Make sure user exists
  if (!user)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Update user
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // response
  res.status(200).json({ success: true, data: user });
});

// @desc        Delete a user by Id
// @route       DELETE /api/v1/users/:id
// @access      Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Get user by id
  let user = await User.findById(req.params.id);

  // Make sure user exists
  if (!user)
    return next(
      new ErrorResponse(`Resource Not Found With ID of ${req.params.id}`, 404)
    );

  // Remove user
  await User.findByIdAndDelete(req.params.id);

  // response
  res.status(204).json({ success: true, data: {} });
});
