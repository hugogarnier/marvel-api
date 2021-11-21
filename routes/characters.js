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

    const isToken = req.query.token;
    if (isToken === "null") {
      res.json(characters.data);
    } else {
      const user = await User.findOne({ token: req.query.token }).populate(
        "charactersFav"
      );
      if (user.charactersFav.length > 0) {
        user.charactersFav.map((fav) => {
          const index = characters.data.results.findIndex(
            (obj) => obj._id === fav._id
          );
          if (index !== -1) {
            characters.data.results[index].favorite = true;
          }
        });
      }
      res.json(characters.data);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// add fav character
router.post("/characters/fav/", isAuthentificated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("charactersFav");
    if (user.charactersFav.length > 0) {
      const index = user.charactersFav.findIndex(
        (obj) => obj._id === req.fields._id
      );
      if (index === -1) {
        user.charactersFav.push(req.fields);
      } else if (req.fields._id) {
        const updateUser = await User.findByIdAndUpdate(req.user._id, {
          $pull: { charactersFav: { _id: req.fields._id } },
        }).populate("charactersFav");
        await updateUser.save();
      }
    } else if (req.fields._id) {
      user.charactersFav.push(req.fields);
    }
    await user.save();
    res.json({ message: "character added to favorite" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/favorites", isAuthentificated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("charactersFav comicsFav")
      .select("charactersFav comicsFav ");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
