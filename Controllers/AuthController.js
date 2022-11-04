const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/Users");
const Band = require("../models/Bands");
dotenv.config();

// requiring database
require("../db/conn");

// sending mail using sendgrid & Setting API KEY
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logOutController = async (req, res) => {
  // destroying all the user credentials and logging out of the current user
  await req.session.destroy(function (err) {
    if (err) console.log(err);
  });
  res.status(200).redirect("/api/login");
};

const homeController = async (req, res) => {
  // if user exists then only user can access home page else redirected to login page
  if (!req.session.user) {
    res.redirect("/api/login");
  }
  try {
    // finding all the bands that the logged in user has created
    // finding bands by userid from the session storage
    console.log("userid: ", req.session.user._id);
    let bandsData = await Band.find({ userid: req.session.user._id });
    console.log("bandsData: ", bandsData);
    // if bandsData exists then only render the home page
    if (bandsData) {
      res.render("home", { uid: req.session.user._id, bands: bandsData });
    }
  } catch (e) {
    // catching the error if something went wrong
    res.status(500);
    console.log(e);
  }
};

const loginController = async (req, res) => {
  // destructuring the email and password from the request body
  const { email, password } = req.body;
  console.log(req.body, email, password);
  // checking if any field is empty
  // if yes then error msg is flashed on screen and redirected to login page
  if (!email || !password) {
    req.flash("error", "please fill the fields correctly");
    return res.status(422).redirect("/api/login");
  }

  try {
    // finding the user in the db via unique email-id from the request body
    const userLogin = await User.findOne({ email: email });
    console.log(userLogin);
    // if user doesn't exist in the db then error msg is flashed and redirected to login page
    if (!userLogin) {
      req.flash("error", "Invalid Credentials");
      return res.status(500).redirect("/api/login");
    } else {
      // if user exists then compare the password from the req body and the password from the userlogin details from db
      const match = await bcrypt.compare(password, userLogin.password);
      // if match variable is true then both password fields match
      if (match) {
        // storing the user id, name and email inside the session store
        req.session.user = {
          _id: userLogin._id,
          name: userLogin.name,
          email: userLogin.email,
        };
        console.log("user login successfull", req.session);
        // flashing the success login msg and redirecting to user home page
        req.flash("success", "you have logged in successfully");
        return res.status(200).redirect("/api/home");
      } else {
        // if match is false then set the session store to null and display an error msg on the screen
        req.session.user = null;
        req.flash("error", "Invalid Credentials");
        res.redirect("/api/login");
      }
    }
  } catch (e) {
    // if any error occurs flash the error on login page
    req.flash("error", e);
    res.redirect("/api/login");
    console.log(e);
  }
};

const registerController = async (req, res) => {
  console.log(" req session: ", req.session.user);
  // if user exists then don't allow the user to access the registration page else redirect to home page
  if (req.session.user) {
    res.redirect("/api/home");
  }
  // destructuring the req body and getting the name,email,organization ,dob, password and cpassword fields
  const { name, email, organization, dob, password, cpassword } = req.body;
  console.log(req.body);
  // since all fields are required if any field is empty then show error msg and redirect to users page
  if (!name || !email || !organization || !password || !dob || !cpassword) {
    req.flash("error", "please fill the fields correctly");
    return res.status(422).redirect("/api/users");
  }

  try {
    // finding if the users entered email from the req body already exists in the database
    const userExist = await User.findOne({ email: email });
    console.log("userExist:", userExist);
    // if yes then give an error msg as account already exist and redirect to login page
    if (userExist) {
      req.flash("error", "Email Already Exist");
      return res.status(422).redirect("/api/users");
    } else if (password !== cpassword) {
      // if password field and cpassword fields don't match then show error.
      req.flash("error", "Password Don't match");
      return res.status(422).redirect("/api/users");
    } else {
      // to add specific data
      const user = new User({
        name,
        email,
        organization,
        dob,
        password,
        cpassword,
      });
      // hashhing password using bcrypt
      user.password = await bcrypt.hash(user.password, 12);
      user.cpassword = await bcrypt.hash(user.cpassword, 12);

      console.log(user);
      try {
        // saving the user added credentials in the db
        // if any error occurs it will go to catch block
        const newUser = await user.save();
        // now users data has been successfully saved into the db
        console.log("newUser: ", newUser);
      } catch (e) {
        console.log(e);
      }
      // now redirecting to login page and flashing the msg
      req.flash("success", "Registration Successfully!");
      res.redirect("/api/login");
    }
  } catch (e) {
    // if any occurs in try block it is handled here
    req.flash("error", "Failed to Register Try Again!");
    res.status(500).redirect("/api/users");
  }
};

// Exporting all controllers using the module.exports
module.exports = {
  logOutController,
  homeController,
  loginController,
  registerController,
};
