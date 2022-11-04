const router = require("express").Router();
const {
  getProfile,
  updateUserDetails,
  deleteUser,
} = require("../Controllers/UserController");

// middleware to check whether user is logged in or not if not redirecting to login page
const middleware = async (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/api/login");
  }
  next();
};

// getting profile page
router.get("/profile", middleware, async (req, res) => {
  res.redirect(`/api/users/user/${req.session.user._id}`);
});

// rendering user profile page
router.get("/:id", middleware, getProfile);

//UPDATE: updating the user details
router.put("/:id", updateUserDetails);

//DELETE ===> for future if we give user to close his account
router.delete("/:id", deleteUser);

module.exports = router;
