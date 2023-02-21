const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGO_URI

module.exports = async function () {
  await mongoose.connect(URI);
};
