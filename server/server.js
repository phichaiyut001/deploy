const { bgCyan } = require("colors");
const connectDb = require("./config/config");
//dotenv config
const dotenv = require("dotenv");
dotenv.config();

//db config
connectDb();

// Importing the framework
const { json } = require("@vercel/node");

// Initializing the express app
const express = require("express");
const app = express();

// Middleware
app.use(require("cors")());
app.use(require("morgan")("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
const path = require("path");
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bills", require("./routes/billsRoutes"));

// Set up Vercel endpoint
module.exports = app;
