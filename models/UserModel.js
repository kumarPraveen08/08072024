const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: 25,
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Email should be valid",
      ],
      required: [true, "Email is required"],
      unique: [true, "Email is already exits"],
    },
    password: {
      type: String,
      minLength: 6,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "subscriber"],
      default: "user",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    forgotToken: String,
    forgotTokenExpire: Date,
    emailToken: String,
    emailTokenExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
