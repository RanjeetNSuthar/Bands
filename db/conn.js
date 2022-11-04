const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
// mongoose.connect()-> returns a promise which is handled using .then()
const db = process.env.DB_URL;
// connecting mongoose with mongodb atlas
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection successfull to mongodb");
  })
  .catch((err) => {
    console.log(`connection error: ${err}`);
  });
