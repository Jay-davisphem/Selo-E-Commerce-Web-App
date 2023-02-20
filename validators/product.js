const { check } = require('express-validator')

module.exports = [
  check('title').isAlphanumeric().isLength({min: 3, 255}).trim(),
  check('')
]
