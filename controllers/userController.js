const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const Otp = require("../models/Otp");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Transaction = require("../models/Transaction");
const createToken = (user) => {
  return jwt.sign({ user }, process.env.SECRET, {
    expiresIn: "7d",
  });
};

const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
let refreshTokens = [];
let accessTokens = [];

module.exports.registerValiations = [
  body("name").not().isEmpty().trim().withMessage("Name is required"),
  body("email").not().isEmpty().trim().withMessage("Email is required"),
  body("phone").not().isEmpty().trim().withMessage("mobile number is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters long"),
];
module.exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Email is already taken" }] });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const user = await User.create({
        name,
        email,
        password: hash,
        phone,
      });
      return res.status(200).json({ msg: `${name} account has been created` });
    } catch (error) {
      return res.status(500).json({ errors: error });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
module.exports.loginValiations = [
  body("email").not().isEmpty().trim().withMessage("Email is required"),
  body("password").not().isEmpty().withMessage("Password is required"),
];
module.exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        const { coins, phone } = user;
        return res
          .status(200)
          .json({ msg: "Login Successfull", data: email, coins, phone });
      } else {
        return res
          .status(401)
          .json({ errors: [{ msg: "Password is not correct" }] });
      }
    } else {
      return res.status(404).json({ errors: [{ msg: "Email not found" }] });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

module.exports.emailSend = async (req, res) => {
  const { email } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      let otpData = new Otp({
        email,
        code: Math.floor(100000 + Math.random() * 900000),
        expireIn: new Date().getTime() + 300 * 1000,
      });

      let optResponse = await otpData.save();
      mailer(email, otpData.code);
      return res.status(200).json({ msg: "OTP sended to your mail" });
    } else {
      return res.status(400).json({ errors: [{ msg: "Email not exist" }] });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

module.exports.changePassword = async (req, res) => {
  let data = await Otp.find({ email: req.body.mail, code: req.body.code });
  if (data) {
    let currentTime = new Date().getTime();
    let diff = data.expireIn - currentTime;
    if (diff < 0) {
      return res.status(400).json({ errors: [{ msg: "Token expire" }] });
    } else {
      let user = await User.findOne({ email: req.body.email });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      user.password = hash;
      user.save();
      return res.status(200).json({ msg: "Password changes successfully" });
    }
  } else {
    return res.status(400).json({ errors: [{ msg: "Token Expired" }] });
  }
};

const mailer = (email, otp) => {
  var nodemailer = require("nodemailer");
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "aloksaxena755@gmail.com",
      pass: "wvkgyirquxcwgqzb",
    },
  });
  var mailOptions = {
    from: "aloksaxena755@gmail.com",
    to: email,
    subject: "OTP mail",
    text: otp,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports.authenticateUser = async = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  jwt.verify(accessToken, JWT_AUTH_TOKEN, async (err, email) => {
    if (email) {
      req.email = email;
      next();
    } else if (err.message === "TokenExpiredError") {
      return res.status(403).send({
        success: false,
        msg: "Access token expired",
      });
    } else {
      console.log(err);
      return res.status(403).send({ err, msg: "User not authenticated" });
    }
  });
};

module.exports.sendCoinToFriends = async (req, res) => {
  const { mobile, sendCoin, email } = req.body;

  const getUser = await User.findOne({ email });
  const { _id, coins } = getUser;
  const checkUser = await User.findOne({ phone: mobile });
  if (checkUser === null) {
    res.status(404).json({ msg: "mobile number not found" });
  } else {
    if (coins >= sendCoin) {
      try {
        const minusUserCoin = coins - sendCoin;
        const updateUserCoin = await User.findByIdAndUpdate(
          { _id: ObjectId(_id) },
          {
            coins: minusUserCoin,
          }
        );
        const { id } = checkUser;
        const totalCoinSended = sendCoin + checkUser.coins;
        const updateCoin = await User.findByIdAndUpdate(
          { _id: ObjectId(id) },
          {
            coins: totalCoinSended,
          }
        );
        const addTransaction = await Transaction.create({
          coins: sendCoin,
          sender_phone: getUser.phone,
          sender_name: getUser.name,
          receiver_name: checkUser.name,
          receiver_phone: checkUser.phone,
        });
        const getUserDetail = await User.findOne({ email });
        const updatedCoin = getUserDetail.coins;

        res
          .status(200)
          .json({ msg: "coins sended successfully", getUser, updatedCoin });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("sender coin is greater");
    }
  }
};

module.exports.sendCoinToAdmin = async (req, res) => {
  const { sendCoin, email, adminEmail } = req.body;

  const getUser = await User.findOne({ email });
  const { _id, coins } = getUser;
  const checkUser = await Admin.findOne({ email: adminEmail });
  if (checkUser === null) {
    res.status(404).json({ msg: "admin not found" });
  } else {
    if (coins >= sendCoin) {
      try {
        const minusUserCoin = coins - sendCoin;
        const updateUserCoin = await User.findByIdAndUpdate(
          { _id: ObjectId(_id) },
          {
            coins: minusUserCoin,
          }
        );
        const { id } = checkUser;
        const totalCoinSended = sendCoin + checkUser.coins;
        const updateCoin = await Admin.findByIdAndUpdate(
          { _id: ObjectId(id) },
          {
            coins: totalCoinSended,
          }
        );
        const addTransaction = await Transaction.create({
          coins: sendCoin,
          sender_phone: getUser.phone,
          sender_name: getUser.name,
          receiver_name: checkUser.name,
          receiver_phone: checkUser.phone,
        });
        const getUserDetail = await User.findOne({ email });
        const updatedCoin = getUserDetail.coins;
        res.status(200).json({ msg: "coins sended successfully", updatedCoin });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("sender coin is greater");
    }
  }
};

module.exports.showUserCoinDebitTransaction = async (req, res) => {
  const { mobile } = req.body;
  try {
    const getTran = await Transaction.find({ sender_phone: mobile });
    return res.status(200).json(getTran);
  } catch (error) {
    console.log(error);
  }
};

module.exports.showUserCoinCreditTransaction = async (req, res) => {
  const { mobile } = req.body;
  try {
    const getTran = await Transaction.find({ receiver_phone: mobile });
    return res.status(200).json(getTran);
  } catch (error) {
    console.log(error);
  }
};

module.exports.showAllUser = async (req, res) => {
  try {
    const userDetail = await User.find();
    return res.status(200).json({ response: userDetail });
  } catch (error) {
    console.log(error);
  }
};

module.exports.loggedUserDetail = async (req, res) => {
  const { email } = req.body;
  try {
    const userDetail = await User.findOne({ email });
    return res.status(200).json({ response: userDetail });
  } catch (error) {
    console.log(error);
  }
};
