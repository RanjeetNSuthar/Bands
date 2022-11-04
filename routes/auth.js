const express = require("express");
const router = express.Router();
const {
  logOutController,
  homeController,
  loginController,
  registerController,
} = require("../Controllers/AuthController");

// middleware to check if user is logged in
const isUserLoggedIn = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/api/home");
  }
  next();
};

// get register route: rendering the register page
router.get("/users", isUserLoggedIn, async (req, res) => {
  res.render("register");
});

// get login page route:  rendering the login page
router.get("/login", isUserLoggedIn, async (req, res) => {
  res.render("login");
});

// logging out and destroying the session
router.get("/logout", logOutController);

// get home page route
router.get("/home", homeController);

// login post route
router.post("/login", loginController);

// create a new user from registration form data
router.post("/users", registerController);

module.exports = router;
