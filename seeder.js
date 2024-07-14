const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load Models
const User = require("./models/UserModel");
const Store = require("./models/StoreModel");

// Connect to database
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const stores = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/stores.json`, "utf-8")
);

// Import to DB
const importData = async () => {
  try {
    await User.create(users);
    await Store.create(stores);
    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Store.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") importData();
else if (process.argv[2] === "-d") deleteData();
