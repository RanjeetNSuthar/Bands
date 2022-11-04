const Band = require("../models/Bands");

const allBands = async (req, res) => {
  try {
    // finding all other bands created by other users as well
    let bands = await Band.find();
    // res.status(200).json(bands);
    // rendering the explore page with all the bands found in the db
    res.render("explore", { uid: req.session.user._id, bands: bands });
  } catch (err) {
    req.flash("error", err);
    res.status(500).redirect("/api/home");
  }
};

const userSpecificBands = async (req, res) => {
  console.log(req.params.uid, req.params.bid);
  // finding the band details and rendering that details on the edit-band page
  const band = await Band.findById(req.params.bid);
  console.log("inside", band);
  if (band.userid == req.params.uid) {
    // rendering the edit band page only if userid and req.params.uid matches
    try {
      res.render("edit-band", {
        uid: req.params.uid,
        bid: req.params.bid,
        band,
      });
    } catch (err) {
      res.status(500).redirect("/api/home");
      // res.status(500).json({ error: err });
    }
  }
};

const addBand = async (req, res) => {
  // finding the band with the entered band name and storing it in findBand variable
  const findBand = await Band.findOne({ name: req.body.name });
  // if findBand doesn't exist means there are no bands with the same name in the db
  // now we can create the new band
  if (!findBand) {
    // destructuring the request body
    const { name, desc, origin, rating } = req.body;
    // storing the userid from the url
    const userid = req.params.uid;
    // getting email of an user from session storage
    const email = req.session.user.email;
    // creating a bandObject variable with all the data that need to be passed
    const bandObject = {
      name: name,
      desc: desc,
      origin: origin,
      rating: rating,
      userid: userid,
      email: email,
    };
    console.log("bandObject: ", bandObject);
    // creating new band by passing bandObject  variable
    const newBand = new Band(bandObject);

    try {
      // now saving the new band data into db
      //  if it gets saved with no error then it will redirect to home page and flash success msg
      // else throws an error
      const savedBand = await newBand.save();
      console.log(savedBand);
      req.flash("success", `${savedBand.name} is created Successfully!!!`);
      res.status(201).redirect("/api/home");
    } catch (err) {
      req.flash("error", `Couldn't create the band`);
      res.status(500).redirect("/api/home");
      // res.status(500).json(err);
    }
  } else {
    // if entered band name from the body already exists then show an error
    req.flash("error", `Band Name Already Exist`);
    // res.status(422).redirect(`api/users/user/${req.params.uid}`);
  }
};

const editBand = async (req, res) => {
  try {
    console.log("inside edit band :>> ", req.body);
    // finding the band from the given band id from url
    const band = await Band.findById(req.params.bid);
    // checking if the user id from the founded band is same as from the url
    if (band.userid == req.params.uid) {
      try {
        console.log("user id matched");
        // finding the band details and updating it in the db
        const updatedBand = await Band.findByIdAndUpdate(
          req.params.bid,
          {
            $set: req.body,
          },
          { new: true }
        );
        console.log("updated :>> ", updatedBand);
        // flashing the success msg
        req.flash("success", "Band Details Updated Successfully.");
        // redirecting to home after successfull updation of details
        res.status(201).redirect("/api/home");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      req.flash("error", "You can update only your band details");
      res.status(500).redirect("/api/home");
    }
  } catch (err) {
    // if any error occurs inside try block then flashing an error msg and redirecting to home
    req.flash("error", "Couldn't update Band Details");
    res.status(500).redirect("/api/home");
  }
};

const deleteBand = async (req, res) => {
  try {
    // finding the band to be deleted from the bands db
    console.log("inside delete route", req.body);
    const band = await Band.findById(req.params.bid);
    // if userid of band and the uid of url matches then make the delete operation
    if (band.userid == req.params.uid) {
      try {
        // deleting the band using the mongoose delete() method
        await band.delete();
        // after successfull deletion of band flash success msg and redirect to home page
        req.flash("success", "Band has been deleted Successfully!");
        res.status(200).redirect("/api/home");
      } catch (err) {
        req.flash("error", "Band Couldn't be deleted, Try Again.");
        res.status(500).redirect(`/api/home`);
      }
    }
  } catch (err) {
    req.flash("error", "Band Couldn't be deleted, Try Again.");
    res.status(500).redirect("/api/home");
  }
};

module.exports = {
  addBand,
  allBands,
  userSpecificBands,
  deleteBand,
  editBand
};

