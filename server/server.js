const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { bgCyan } = require("colors");
const bcrypt = require("bcrypt");
require("colors");
const connectDb = require("./config/config");

//dotenv config
dotenv.config();

//db config
connectDb();

//rest object
const app = express();

//middlwares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

//routes
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bills", require("./routes/billsRoutes"));

module.exports = app;
