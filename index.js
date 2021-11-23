if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
// for passport module
const passport = require("passport");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const flash = require("express-flash");
const session = require("express-session");
const {
  initializePassword,
  checkNotAuthenticated,
  checkAuthenticated,
} = require("./middleware/authMiddleware.js");
// for mongodb module
const mongoose = require("mongoose");
const morgan = require("morgan");
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const usersRouter = require("./routers/users");
// const ordersRouter = require("./routers/orders");
const cors = require("cors");
const { authJwt } = require("./helpers/jwt.js");
const { errorHandler } = require("./helpers/error-handler.js");

app.options("*", cors());

const api = process.env.API_URL;
const users = [];

// mongodb middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(authJwt());
app.use(errorHandler);

// routes
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
// app.use(`${api}/orders`, ordersRouter);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true, //ユーザーが新しいパーサーにバグを見つけたとき古いパーサーに逆戻りする機能
    useUnifiedTopology: true, //新しいトポロジエンジンに関連しなくなったいくつかの接続オプションのサポートが削除される機能
  })
  .then(() => console.log("mongodb connected!"))
  .catch((error) => console.log(error));

initializePassword(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// index page
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

//register post
app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

//login post
app.post(
  "/login",
  checkNotAuthenticated,
  // ユーザー認証を実行する
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//register get
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

//login get
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

//delete
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//set port
app.listen(3000);
