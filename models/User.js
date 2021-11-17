const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    unique: true,
    type: String,
  },
  token: String,
  hash: String,
  comicsFav: [],
  charactersFav: [],
});

module.exports = mongoose.model("User", userSchema);
