const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log in console for developer
  console.log(err);

  // Mongoose Bad Object Id
  if (err.name === "CastError") {
    const message = `Resource Not Found With ID Of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate key
  if (err.code === 11000) {
    const message = "Duplicate Field Value Entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validator Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ status: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;
