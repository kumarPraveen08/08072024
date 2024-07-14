const crypto = require('node:crypto');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: 25,
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

// Encrypt password using bcryptjs
UserSchema.pre("save", async function (next) {
  // Passwod if not modified
  if (!this.isModified("password")) next();

  // bcrypt salt created
  const salt = await bcrypt.genSalt(10);

  // changing password to hash password before save
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // token generating with jwt
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};

// Comparing entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a reset token for password reset
  UserSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");
    this.forgotToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.forgotTokenExpire = Date.now() + 3600000; // 1 hour

    return resetToken;
  };

module.exports = mongoose.model("User", UserSchema);
