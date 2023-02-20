const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const {
  checkEmail,
  checkPassword,
  checkEmailExist,
  comparePassword,
} = require("../validators/user");
router.get("/login", authController.getLogin);
router.post("/login", [checkEmail, checkPassword], authController.postLogin);
router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [checkEmail, checkPassword, checkEmailExist, comparePassword],
  authController.postSignUp
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);
module.exports = router;
