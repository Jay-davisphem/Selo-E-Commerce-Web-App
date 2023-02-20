const path = require("path");
exports.path = path.dirname(require.main.filename);

exports.getPath = (fname) =>
  path.join(path.dirname(require.main.filename), "data", fname);
