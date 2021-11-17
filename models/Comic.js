const mongoose = require("mongoose");
const { Schema } = mongoose;

const comicSchema = new Schema({
  thumbnail: {
    path: String,
    extension: String,
  },
  id: String,
  title: String,
  description: String,
});

module.exports = mongoose.model("Comic", comicSchema);
