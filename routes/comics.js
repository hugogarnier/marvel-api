const express = require("express");
const axios = require("axios");
const router = express.Router();

const isAuthentificated = require("../middlewares/isAuthentificated");
const User = require("../models/User");

// get all comics
router.get("/comics", async (req, res) => {
  try {
    let title = "";
    let limit = 48;
    let page = 1;

    req.query.title ? (title = req.query.title.toLowerCase()) : title;
    Number(req.query.page) ? (page = Number(req.query.page)) : page;
    Number(req.query.limit) ? (limit = Number(req.query.limit)) : limit;

    const comics = await axios.get(
      `${process.env.MARVEL_API_URI}/comics?apiKey=${
        process.env.MARVEL_API_KEY
      }&title=${title}&limit=${limit}&skip=${page * limit - limit}`
    );

    res.json(comics.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// get all from character
router.get("/comics/:characterId", async (req, res) => {
  try {
    let characterId = "";

    req.params.characterId
      ? (characterId = req.params.characterId)
      : characterId;
    const comics = await axios.get(
      `${process.env.MARVEL_API_URI}/comics/${characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );

    res.json(comics.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// add fav comic
router.post("/comics/fav/:id", isAuthentificated, async (req, res) => {
  try {
    let id = "";

    req.params.id ? (id = req.params.id) : id;
    const comics = await axios.get(
      `${process.env.MARVEL_API_URI}/comics?apiKey=${process.env.MARVEL_API_KEY}`
    );
    const comicToFav = comics.data.results.find((comic) => comic._id === id);
    if (comicToFav) {
      const user = await User.findById(req.user._id).populate("comicsFav");
      const isAlreadyFav = user.comicsFav.some((comic) => comic._id === id);

      if (isAlreadyFav) {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { comicsFav: { _id: id } },
        }).populate("comicsFav");

        res.json({ message: "Comic removed from favorite" });
      } else {
        user.comicsFav.push(comicToFav);
        await user.save();
        res.json({ message: "Comic added to favorite" });
      }
    } else {
      res.status(400).json({ message: "Error during fav feature" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
