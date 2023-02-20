const { check } = require("express-validator");
const User = require("../models/user");
exports.checkEmail = check("email").trim().isEmail();

exports.checkPassword = check("password")
  .isAlphanumeric()
  .isLength({ min: 5, max: 10 });

exports.checkEmailExist = check("email").custom(async (value, { req }) => {
  const user = await User.findOne({ email: value });
  if (user) {
    throw new Error("User already exists, please login or try another email.");
  }
  return true;
});

exports.comparePassword = check("password").custom((value, { req }) => {
  if (value !== req.body.confirmPassword) {
    throw new Error("Password confirmation does not match password");
  }
  return true;
});
