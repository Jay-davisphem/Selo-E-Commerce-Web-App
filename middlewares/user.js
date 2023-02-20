const User = require("../models/user");
module.exports = async (req, res, next) => {
  try {
    let user;
    if (!req.session.user) {
      return next();
    }
    user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
  }
};
