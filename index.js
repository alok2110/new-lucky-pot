const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./config/db");
const router = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bidRoutes = require("./routes/bidRoutes");

const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use(cookieParser());

app.use("/", router);
app.use("/", adminRoutes);
app.use("/", bidRoutes);

connect();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Your app is running`);
});
