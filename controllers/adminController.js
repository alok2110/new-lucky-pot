const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Admin = require("../models/Admin");
const CoinGenrateHistory = require("../models/CoinGenrateHistory");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
var ObjectId = require("mongodb").ObjectID;
const ResultDeclare = require("../models/ResultDeclare");

const createToken = (user) => {
  return jwt.sign({ user }, process.env.SECRET, {
    expiresIn: "7d",
  });
};

module.exports.register = async (req, res) => {
  const { email, password, phone, name } = req.body;

  try {
    const checkUser = await Admin.findOne({ email });
    if (checkUser) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Email is already taken" }] });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const user = await Admin.create({
        email,
        password: hash,
        phone,
        name,
      });
      return res.status(200).json({ msg: "Your account has been created" });
    } catch (error) {
      return res.status(500).json({ errors: error });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

module.exports.login = async (req, res) => {
  const errors = validationResult(req);

  const { email, password } = req.body;
  try {
    const user = await Admin.findOne({ email });
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        const { _id } = user;
        updateSuccessCode = await Admin.findByIdAndUpdate(_id, {
          sucessCode: 1,
        });
        const upadtedUser = await Admin.findOne({ email });
        res.send({ msg: "Login Successfull", response: upadtedUser });
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

module.exports.genrateCoinAdmin = async (req, res) => {
  const { email, genratedCoin } = req.body;
  const { coins } = await Admin.findOne({ email });
  const totalCoins = genratedCoin + coins;
  try {
    const genrateCoinAdmin = await Admin.findOneAndUpdate(
      { email },
      {
        coins: totalCoins,
      }
    );
    const { name, coins } = await Admin.findOne({ email });
    const addHistory = await CoinGenrateHistory.create({
      name,
      coin: genratedCoin,
      genrateDate: new Date().toDateString(),
    });
    res.status(200).json({ msg: "Coin genrated successfully", coins });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getGenrateCoinAdmin = async (req, res) => {
  try {
    const getData = await CoinGenrateHistory.find({});
    res.status(200).json({ response: getData });
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendCoinToUser = async (req, res) => {
  const { mobile, sendCoin, email } = req.body;

  const getUser = await Admin.findOne({ email });
  const { _id, coins } = getUser;
  const checkUser = await User.findOne({ phone: mobile });
  if (checkUser === null) {
    res.status(404).json({ msg: "mobile number not found" });
  } else {
    if (coins >= sendCoin) {
      try {
        const minusUserCoin = coins - sendCoin;
        const updateUserCoin = await Admin.findByIdAndUpdate(
          { _id: ObjectId(_id) },
          {
            coins: minusUserCoin,
          }
        );
        const { id } = checkUser;
        const totalCoinSended = sendCoin + checkUser.coins;
        const updateCoin = await User.findByIdAndUpdate(
          { _id: ObjectId(checkUser._id) },
          {
            coins: totalCoinSended,
          }
        );
        console.log(updateCoin);
        const addTransaction = await Transaction.create({
          coins: sendCoin,
          sender_phone: getUser.phone,
          sender_name: getUser.name,
          receiver_name: checkUser.name,
          receiver_phone: checkUser.phone,
        });
        const getUserDetail = await Admin.findOne({ email });
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

module.exports.showAdminCoinDebitTransaction = async (req, res) => {
  const { mobile } = req.body;
  try {
    const getTran = await Transaction.find({ sender_phone: mobile });
    return res.status(200).json(getTran);
  } catch (error) {
    console.log(error);
  }
};

module.exports.showAdminCoinCreditTransaction = async (req, res) => {
  const { mobile } = req.body;
  try {
    const getTran = await Transaction.find({ receiver_phone: mobile });
    return res.status(200).json(getTran);
  } catch (error) {
    console.log(error);
  }
};

module.exports.addResultDeclare = async (req, res) => {
  const { date, time } = req.body;
  try {
    const addData = await ResultDeclare.create({ date, time });
    return res
      .status(200)
      .json({ msg: "Result declare successfully added", addData });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getResultDeclare = async (req, res) => {
  try {
    const getData = await ResultDeclare.find();
    return res.status(200).json(getData);
  } catch (error) {
    console.log(error);
  }
};

module.exports.editResultDeclare = async (req, res) => {
  const { date, time } = req.body;
  try {
    const editData = await ResultDeclare.findByIdAndUpdate(
      {
        _id: ObjectId(req.params.id),
      },
      { date, time }
    );
    return res
      .status(200)
      .json({ msg: "Result declare successfully added", editData });
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteResultDeclare = async (req, res) => {
  try {
    const deleteData = await ResultDeclare.findByIdAndRemove({
      _id: ObjectId(req.params.id),
    });
    return res.status(200).json({ msg: "Result declare successfully deleted" });
  } catch (error) {
    console.log(error);
  }
};
