const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/Users");
dotenv.config();

// sending mail using sendgrid
const sgMail = require("@sendgrid/mail");
// setting api key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpToEmail = async (req, res) => {
  // getting the email from the req body
  const { email } = req.body;
  console.log(email);
  // check if email is empty or not
  // if email is empty then flash an error msg
  if (!email) {
    req.flash("error", "Email field is required");
    return res.status(422).redirect("/api/users/send-otp");
  }

  try {
    // finding the email in the users databse if exists then send an otp msg
    const userLogin = await User.findOne({ email: email });
    console.log(userLogin);
    // if email doesn't exist in db then show an error msg
    if (!userLogin) {
      req.flash("error", "Email is not Registered.");
      return res.status(500).redirect("/api/users/send-otp");
    } else {
      console.log("sending message...");
      // making a random otp number using Math module of JS.
      const otp = Math.floor(Math.random() * 10000 + 1);
      // storing the otp and the entered email along with the otp Expiretime in the session storage
      req.session.otp = otp;
      req.session.email = email;
      // setting otpExpire time for 5 minutes
      req.session.otpExpireTime = new Date().getTime() + 300 * 1000;
      // msg object contains details from which email-id will the email would be send to which email-id
      const msg = {
        to: email, // to whom the email will be send
        from: "maheshgajakosh15@gmail.com",
        subject: "Reset Password Otp",
        html: `Your Otp is: <strong> ${otp}  </strong> `,
      };
      console.log(otp);
      // sending otp via sendgrid email api
      await sgMail.send(msg);
      console.log("message send");
      req.flash("warning", "OTP has been sent to your Registered Email!");
      console.log("redirecting to verify page");
      res.redirect("/api/users/verify-otp");
    }
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};

const verifyingOtp = async (req, res) => {
  // getting the entered otp
  const { otp } = req.body;
  console.log(otp, req.session.otp);
  console.log("req.session", req.session);
  // checking if otp exists or not
  if (!otp) {
    // flashing an error msg
    req.flash("error", "Please Enter OTP");
    return res.status(422).redirect("/api/users/verify-otp");
  }
  // checking if the entered otp is same as the otp sended to the user
  if (otp == req.session.otp) {
    // storing the verifyotp variable to say that the otp has been verified
    // user can access reset-password page iff verifyOtp === true
    req.session.verifyOtp = true;
    // redirecting to reset-password page
    req.flash("success", "Your Otp has been verified");
    return res.status(201).redirect("/api/users/reset-password");
  } else {
    // setting verifyOtp to false so that without verification no one can access the reset-password page
    req.session.verifyOtp = false;
    req.flash("error", "Please Enter Valid OTP");
    return res.status(422).redirect("/api/users/verify-otp");
  }
};

const resetPassword = async (req, res) => {
  // checking if any user is logged in and trying to access the reset-password page then redirect to home page
  if (req.session.user) {
    res.redirect("/api/home");
  }
  // checking if the verifyOtp is true or false
  // if false then redirect to login page
  if (!req.session.verifyOtp) {
    res.redirect("/api/login");
  }

  // getting the password and cpassword from the req body
  const { password, cpassword, email } = req.body;
  // checking if any of the fields are empty or not
  if (!email || !password || !cpassword) {
    // if empty then redirect with an error msg
    req.flash("error", "please fill the fields correctly");
    return res.status(422).redirect("/api/users/reset-password");
  }
  // checking if the entered password and cpassword are the same or not
  // if not show an error msg
  if (password !== cpassword) {
    req.flash("error", "Password and Confirm Password doesn't match");
    return res.status(422).redirect("/api/users/reset-password");
  } else {
    // to update password data
    try {
      // hashing password using bcrypt package
      const hashpassword = await bcrypt.hash(password, 12);
      const hashcpassword = await bcrypt.hash(cpassword, 12);
      // finding the user details and updating the password fields
      const user = await User.findOneAndUpdate(
        {
          email: email,
        },
        {
          $set: {
            password: hashpassword,
            cpassword: hashcpassword,
          },
        },
        { new: true }
      );
      console.log(user);
      console.log("Password updated successfully");
      // show an success msg and redirect to login page
      req.flash("success", "Password updated successfully");
      res.status(200).redirect("/api/login");
    } catch (e) {
      req.flash("error", "Password couldn't be updated");
      // res.status(500).redirect("/api/users/reset-password");
      console.log(e);
    }
  }
};

module.exports = {
  sendOtpToEmail,
  verifyingOtp,
  resetPassword,
};
