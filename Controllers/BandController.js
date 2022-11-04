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
module.exports = {
  allBands,
  userSpecificBands,
};
