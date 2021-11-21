if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
// for passport module
const bcrypt = require("bcrypt");
const passport = require("passport");
const methodOverride = require("method-override");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./middleware/authMiddleware.js");
// for mongodb module
const mongoose = require("mongoose");
const morgan = require("morgan");

const api = process.env.API_URL;
const users = [];

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.use(morgan("tiny"));
app.use(express.json());
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
// for logout
app.use(methodOverride("_method"));

// index page
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

//login page
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

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

//register page
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

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

//delete
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//redirect middleware①
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

//redirect middleware②
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: Number,
});
const Product = mongoose.model("Product", productSchema);

app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: "hair dresser",
    image: "some_url",
  };
  res.send(product);
});

app.post(`${api}/products`, (req, res) => {
  console.log(req.body, "req.body");
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true, //ユーザーが新しいパーサーにバグを見つけたとき古いパーサーに逆戻りする機能
    useUnifiedTopology: true, //新しいトポロジエンジンに関連しなくなったいくつかの接続オプションのサポートが削除される機能
  })
  .then(() => console.log("mongodb connected!"))
  .catch((error) => console.log(error));

//set port
app.listen(3000);
