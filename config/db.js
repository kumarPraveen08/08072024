const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connected on host: ${conn.connection.host}`.magenta.bold
    );
  } catch (error) {
    console.log(`[DATABASE] Something went wrong`.red.bold.underline.inverse);
  }
};

module.exports = connectDB;
