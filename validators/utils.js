const {validationResult} = require('express-validator')
exports.getMsg = (req) => {
  const message = req.flash("error");
  return message.length > 0 ? message[0] : null;
};

exports.getVMsg = (req) => {
  try {
    const errors = validationResult(req);
    return !errors.isEmpty() ? errors.array() : [];
  } catch (err) {
    console.error(err);
  }
};
