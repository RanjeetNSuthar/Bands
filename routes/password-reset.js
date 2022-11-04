const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const User = require("../models/Users");
dotenv.config();

// requiring controllers
const {
  sendOtpToEmail,
  verifyingOtp,
  resetPassword,
} = require("../Controllers/ResetPasswordController");

// requiring database
require("../db/conn");

// getting forgot password page
router.get("/api/users/send-otp", async (req, res) => {
  if (req.session.user) {
    res.redirect("/api/home");
  }
  res.render("reset-password/send-otp");
});

// verifying the entered otp page
router.get("/api/users/verify-otp", async (req, res) => {
  console.log("inside verify page");
  if (req.session.user) {
    res.redirect("/api/home");
  }
  if (!req.session.otp) {
    res.redirect("/api/login");
  }
  res.render("reset-password/verify-otp", { email: req.session.email });
});

// password reset page
router.get("/api/users/reset-password", async (req, res) => {
  if (req.session.user) {
    res.redirect("/api/home");
  }
  if (!req.session.otp || !req.session.verifyOtp) {
    res.redirect("/api/login");
  }
  res.render("reset-password/reset-password", { email: req.session.email });
});

// sending otp to users entered email
router.put("/api/users/send-otp", sendOtpToEmail);

// verifying the entered otp with the sent otp
router.post("/api/users/verify-otp", verifyingOtp);

// resetting the password
router.put("/api/users/reset-password", resetPassword);

module.exports = router;
