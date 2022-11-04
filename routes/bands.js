const router = require("express").Router();
const {
  allBands,
  userSpecificBands,
} = require("../Controllers/BandController");
const Band = require("../models/Bands");

// GET USER SPECIFIC BANDS
router.get("/:uid/bands/band/:bid", userSpecificBands);

//GET ALL BANDS
router.get("/bands/explore", allBands);

module.exports = router;
