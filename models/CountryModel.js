const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
    id: {
      type: String, 
      required: true,
      unique: true
    },
    symbol: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      unique: [true, "Country is already exits"],
    },
});

module.exports = mongoose.model('Store', CountrySchema);