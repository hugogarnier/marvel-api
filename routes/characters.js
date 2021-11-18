const express = require("express");
const axios = require("axios");
const router = express.Router();

const isAuthentificated = require("../middlewares/isAuthentificated");
const User = require("../models/User");

// get all characters
router.get("/characters", async (req, res) => {
  try {
    let name = "";
    let limit = 48;
    let page = 1;

    req.query.name ? (name = req.query.name.toLowerCase()) : name;
    Number(req.query.page) ? (page = Number(req.query.page)) : page;
    Number(req.query.limit) ? (limit = Number(req.query.limit)) : limit;

    const characters = await axios.get(
      `${process.env.MARVEL_API_URI}/characters?apiKey=${
        process.env.MARVEL_API_KEY
      }&name=${name}&limit=${limit}&skip=${page * limit - limit}`
    );

    res.json(characters.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// add fav character
router.post("/characters/fav/:id", isAuthentificated, async (req, res) => {
  try {
    let id = "";

    req.params.id ? (id = req.params.id) : id;
    const characters = await axios.get(
      `${process.env.MARVEL_API_URI}/characters?apiKey=${process.env.MARVEL_API_KEY}`
    );
    const characterToFav = characters.data.results.find(
      (character) => character._id === id
    );
    if (characterToFav) {
      const user = await User.findById(req.user._id).populate("charactersFav");
      const isAlreadyFav = user.charactersFav.some(
        (character) => character._id === id
      );

      if (isAlreadyFav) {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { charactersFav: { _id: id } },
        }).populate("charactersFav");

        res.json({ message: "character removed from favorite" });
      } else {
        user.charactersFav.push(characterToFav);
        await user.save();
        res.json({ message: "character added to favorite" });
      }
    } else {
      res.status(400).json({ message: "Error during fav feature" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
