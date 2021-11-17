const mongoose = require("mongoose");
const { Schema } = mongoose;

const characterSchema = new Schema({
  thumbnail: {
    path: String,
    extension: String,
  },
  id: String,
  name: String,
  description: String,
  comics: [
    {
      id: String,
    },
  ],
});

module.exports = mongoose.model("Character", characterSchema);
