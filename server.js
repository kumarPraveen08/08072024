const path = require("path");
const morgan = require("morgan");
const colors = require("colors");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
connectDB();

// Local routes
const users = require("./rotues/auth");

// App
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Dev loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/auth", users);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}, check it out live: http://localhost:${PORT}`
      .yellow.bold
  )
);

// Handle undefined promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server and exit process
  server.close(() => process.exit(1));
});
