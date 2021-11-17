require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// middleware import
const middlewawreFormidable = require("express-formidable");

const app = express();
app.use(middlewawreFormidable());
app.use(cors());

// import routes - last one if page not found
const authRoutes = require("./routes/auth");
const comicsRoutes = require("./routes/comics");
const charactersRoutes = require("./routes/characters");
const pageNotFoundRoutes = require("./routes/notFound");
app.use(authRoutes);
app.use(comicsRoutes);
app.use(charactersRoutes);
app.use(pageNotFoundRoutes);

// connect to mongoDB  - vinted database
mongoose.connect(process.env.MONGODB_URI);

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server has started on port ${process.env.PORT || 4000} 🚀 `)
);
