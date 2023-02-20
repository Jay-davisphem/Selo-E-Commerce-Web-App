const mongoose = require("mongoose");
require("dotenv").config();
const URI = `mongodb+srv://davisphem:${process.env.MG_PWD}@davisphem.jsmcxlo.mongodb.net/?retryWrites=true&w=majority`;

module.exports = async function () {
  await mongoose.connect(URI);
};
