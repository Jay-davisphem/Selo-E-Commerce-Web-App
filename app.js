const path = require("path");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
//const RedisStore = require("connect-redis")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { randomUUID } = require("crypto");
const errorController = require("./controllers/error");
const useUser = require("./middlewares/user");
const useLocals = require("./middlewares/addLocals");
const SetUp = require("./models");

const app = express();

// multer storage config
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + file.originalname);
  },
});
// multer file filter
const fileFilter = (req, file, cb) => {
  const mimetypes = new Set(["image/png", "image/jpg", "image/jpeg"]);
  if (mimetypes.has(file.mimetype)) cb(null, true);
  else cb(null, false);
};
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// redis@v4
/*const { createClient } = require("redis");
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);
*/
const csrfProtection = csrf(process.env.SECRET);
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    //store: new RedisStore({ client: redisClient }),
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use(useUser);
app.use(useLocals);
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    error: error,
    isAuthenticated: req.session.isLoggedIn,
  });
});
SetUp()
  .then((res) => {
    console.log("Connected");
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
