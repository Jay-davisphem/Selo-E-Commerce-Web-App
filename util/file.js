const fs = require('fs')
exports.deleteFile = (filePath, cb=null) => {
  if(cb)
    return cb()
  return fs.unlink(filePath, (err) => {
    if(err)
      throw err
  })
}
