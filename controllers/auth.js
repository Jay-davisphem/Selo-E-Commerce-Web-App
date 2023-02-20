const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const { validationResult } = require("express-validator");
const { getMsg, getVMsg } = require("../validators/utils");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const User = require("../models/user");
const ADMIN_MAIL = "davidoluwafemi178@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PWD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    data: {},
    errorMessage: getMsg(req),
    validationErrors: getVMsg(req),
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid user");
      return res.redirect("/login");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      req.flash("error", "Invalid email or password");
      return res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        data: { email },
        errorMessage: getMsg(req),
        validationErrors: getVMsg(req),
      });
    }
    req.session.user = user;
    req.session.isLoggedIn = true;
    const err = await req.session.save();
    if (err) console.error(err, "session error");
    res.redirect("/");
    const msg = {
      to: email, // Change to your recipient
      from: ADMIN_MAIL, // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    const data = await sgMail.send(msg);
    console.log(data);
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  const err = await req.session.destroy();
  if (err) console.error(err, "session error");
  res.redirect("/");
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    data: {},
    errorMessage: getMsg(req),
    validationErrors: getVMsg(req),
  });
};
exports.postSignUp = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  console.log(email, password, confirmPassword);
  if (await User.findOne({ email })) {
    req.flash("error", "E-Mail exists already, please pick a different one.");
    return res.redirect("/signup");
  }
  if (password !== confirmPassword) {
    req.flash("error", "password does not match");
    return res.render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      data: { email, password },
      errorMessage: getMsg(req),
      validationErrors: getVMsg(req),
    });
  }
  const hashedPwd = await bcrypt.hash(password, 12);
  const user = new User({ email, password: hashedPwd, cart: { items: [] } });
  await user.save();
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    data: { email, password },
    errorMessage: "Account created please login.",
    validationErrors: getVMsg(req),
  });
  const mailOptions = {
    from: ADMIN_MAIL,
    to: email,
    subject: "Account Creation",
    text: "Account created for your selo app " + email,
  };
  return transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully", data);
    }
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: getMsg(req),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: ADMIN_MAIL,
          subject: "Password reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: getMsg(req),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
};
