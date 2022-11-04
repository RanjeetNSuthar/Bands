const express = require("express");
const dotenv = require("dotenv");
const app = express();
const auth = require("./routes/auth");
const userRoute = require("./routes/users");
const bandRoute = require("./routes/bands");
const resetPasswordRoute = require("./routes/password-reset");
const session = require("express-session");
const ejs = require("ejs");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const MongoDBSession = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();
const port = process.env.PORT || 3000;

// override with POST having ?_method=DELETE,PUT,PATCH
app.use(methodOverride("_method"));

// setting view engine template as ejs
app.set("view engine", "ejs");

// express.static() to store static files in public folder
app.use(express.static("public"));

// requiring db
require("./db/conn");

// db to store sessions
const store = new MongoDBSession({
  uri: process.env.DB_URL,
  collection: "mySessions",
});

// express.json() -> inbuilt method to recognise the incoming object as JSON Object
// known as the middleware
app.use(express.json());

// creating session
const sessionConfig = {
  key: "user_sid",
  secret: "thiscouldbeabettersecret",
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// using flash()
app.use(flash());

// middleware before to check the type of flashing
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.warning = req.flash("warning");
  next();
});

// redirecting to login page on landing
app.get("/", (req, res) => {
  res.redirect("/api/login");
});

// adding api routes
app.use("/", resetPasswordRoute);
app.use("/api", auth);
app.use("/api/users/user", userRoute);
app.use("/api/users", bandRoute);

// listening on port 3000
app.listen(port, () => {
  console.log(`connection setup on port ${port}`);
});
