const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("email-validator");

const User = require("../models/User");

// register route
router.post("/user/signup", async (req, res) => {
  try {
    const email = req.fields.email;
    const password = req.fields.password;

    //control email
    if (validator.validate(email)) {
      const user = await User.findOne({ email: email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({
          email: email,
          hash: hash,
        });
        const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY);
        newUser.token = token;
        await newUser.save();
        res.header("Authorization", `Bearer ${token}`);
        res.json({ message: "Account created" });
      } else {
        res.status(400).json({
          message: "An email is already linked to an account",
        });
      }
    } else {
      res.status(400).json({ message: "Email invalid" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//login route
router.post("/user/login", async (req, res) => {
  try {
    const email = req.fields.email;
    const password = req.fields.password;
    if (validator.validate(email)) {
      const user = await User.findOne({ email: email });
      if (user) {
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
        const comparePassword = await bcrypt.compare(password, user.hash);
        if (comparePassword) {
          user.token = token;
          await user.save();
          res.header("Authorization", `Bearer ${token}`);
          res.json({ message: "Login successful", token: token });
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(400).json({ message: "Email not found" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
