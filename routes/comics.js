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

    if (req.query.token) {
      const user = await User.findOne({ token: req.query.token }).populate(
        "comicsFav"
      );
      if (user.comicsFav.length > 0) {
        user.comicsFav.map((fav) => {
          const index = comics.data.results.findIndex(
            (obj) => obj._id === fav._id
          );
          if (index !== -1) {
            comics.data.results[index].favorite = true;
          }
        });
      }
      res.json(comics.data);
    } else {
      res.json(comics.data);
    }
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

// add fav comics
router.post("/comics/fav/", isAuthentificated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("comicsFav");
    const newArr = Object.values(req.fields);

    if (user.comicsFav.length > 0) {
      newArr.map(async (fav) => {
        const index = user.comicsFav.findIndex((obj) => obj._id === fav._id);
        if (index === -1) {
          newArr.map((item) => user.comicsFav.push(item));
        } else {
          const updateUser = await User.findByIdAndUpdate(req.user._id, {
            $pull: { comicsFav: { _id: fav._id } },
          }).populate("comicsFav");
          await updateUser.save();
        }
      });
    } else {
      newArr.map((item) => user.comicsFav.push(item));
    }
    await user.save();
    res.json({ message: "character added to favorite" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
