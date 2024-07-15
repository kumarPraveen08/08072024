const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
    
    symbol: {
      type: String,
    },
    code: {
      type: String,
    },
    lang: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      unique: [true, "Country is already exits"],
    },
});


module.exports = mongoose.model('Country', CountrySchema);