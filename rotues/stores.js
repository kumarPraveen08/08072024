const express = require("express");

const { protect } = require("../middleware/authHandler");
const {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  storePhotoUpload,
} = require("../controllers/storeController");

const advancedResults = require("../middleware/advancedResults");
const Store = require("../models/StoreModel");

const router = express.Router();

router.route("/").get(advancedResults(Store), getStores).post(createStore);
router.route("/:id").get(getStore).put(updateStore).delete(deleteStore);
router.route("/:id/photo/:type").put(storePhotoUpload);

module.exports = router;
