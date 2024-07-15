const express = require("express");

const {
  getCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
} = require("../controllers/countryController");

const router = express.Router();

router.route("/").get(getCountries).post(createCountry);
router.route("/:id").get(getCountry).put(updateCountry).delete(deleteCountry);

module.exports = router;
