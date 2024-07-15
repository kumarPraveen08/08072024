const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Country = require("../models/CountryModel");

// @desc        Get all Countries
// @route       GET /api/v1/countries
// @access      Public

exports.getCountries = asyncHandler(async (req, res, next) => {
  const countries = await Country.find();

  res.status(200).json({
    success: true,
    count: countries.length,
    data: countries,
  });
});

 // @desc        Create a new Country
 // @route       POST /api/v1/country
 // @access      Private
 exports.createCountry = asyncHandler(async (req, res, next) => {
    const country = await Country.create(req.body);  
    res.status(201).json({ success: true, data: country });
  });

// @desc        Get a Country by Id
// @route       GET /api/v1/country/:id
// @access      Public
exports.getCountry = asyncHandler(async (req, res, next) => {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return next(new ErrorResponse(`Country not found with id ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: country });
});

 // @desc        Update a Country
 // @route       PUT /api/v1/country/:id
 // @access      Private
exports.updateCountry = asyncHandler(async (req, res, next) => {
    let country = await Country.findById(req.params.id);
    if (!country) {
      return next(new ErrorResponse(`Country not found with id ${req.params.id}`, 404));
    }
    country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: country });
});

    // @desc        Delete a Country
    // @route       DELETE /api/v1/country/:id
    // @access      Private
    exports.deleteCountry = asyncHandler(async (req, res, next) => {
    let country = await Country.findById(req.params.id);
    if (!country) {
      return next(new ErrorResponse(`Country not found with id ${req.params.id}`, 404));
    }
    await country.remove();
    res.status(200).json({ success: true, message: "Country deleted" });
    });
