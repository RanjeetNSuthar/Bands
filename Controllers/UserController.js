const User = require("../models/Users");
const Band = require("../models/Bands");

const getProfile = async (req, res) => {
  try {
    // finding user details by his userid from the url
    const user = await User.findById(req.params.id);
    // destructuring the user details to be send to profile page
    const { password, cpassword, ...others } = user._doc;
    console.log("others", others);
    //  rendering the profile page and sending required details
    res.render("profile", {
      id: others._id,
      name: others.name,
      email: others.email,
      organization: others.organization,
      dob: others.dob,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateUserDetails = async (req, res) => {
  // checking if the user id from the session store and the id from the url is same or not
  if (req.session.user._id == req.params.id) {
    try {
      // finding the users data and updating it
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      console.log("updated", updatedUser);
      // showing success msg and redirecting to home
      req.flash("success", "profile updated successfully");
      res.status(200).redirect("/api/home");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can update only your account!");
  }
};

const deleteUser = async (req, res) => {
  // checking if the user id from the session store and the id from the url is same or not
  if (req.session.user._id == req.params.id) {
    try {
      // finding the users data and deleting it
      const user = await User.findById(req.params.id);
      try {
        // finding all bands that the user has created and deleting them too
        await Band.deleteMany({ userid: req.params.id });
        await User.findByIdAndDelete(req.params.id);
        console.log("deleted user");
        // destroying all the user credentials and logging out of the current user
        await req.session.destroy(function (err) {
          if (err) console.log(err);
        });
        res.status(200).redirect("/api/login");
        // res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("User not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
};

module.exports = {
  getProfile,
  updateUserDetails,
  deleteUser,
};
