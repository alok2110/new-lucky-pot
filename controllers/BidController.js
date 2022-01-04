const { ObjectId } = require("mongodb");
const Bid = require("../models/Bid");
const User = require("../models/User");

module.exports.placeBid = async (req, res) => {
  const { email, bidPrice, bidNumber } = req.body;
  try {
    const getUserDetail = await User.findOne({ email });
    const currentDate = new Date().toLocaleDateString();
    if (getUserDetail.coins >= bidPrice) {
      const checkUserId = await Bid.findOne({
        userId: ObjectId(getUserDetail._id),
        date: currentDate,
      });
      if (checkUserId) {
        const updateData = await Bid.findByIdAndUpdate(
          {
            _id: ObjectId(checkUserId._id),
          },
          {
            $push: { bid: bidPrice, bidNumber: bidNumber },
            userId: getUserDetail._id,
          }
        );
        const calcUserPoints = getUserDetail.coins - bidPrice;
        const updateUser = await User.findByIdAndUpdate(
          {
            _id: ObjectId(getUserDetail._id),
          },
          { coins: calcUserPoints }
        );
        const getUpdatedUser = await User.findOne({ email });
        return res
          .status(201)
          .json({ msg: "bid placed successfully", getUpdatedUser });
      } else {
        const createData = await Bid.create({
          bid: bidPrice,
          bidNumber,
          userId: getUserDetail._id,
        });
        const calcUserPoints = getUserDetail.coins - bidPrice;
        const updateUser = await User.findByIdAndUpdate(
          {
            _id: ObjectId(getUserDetail._id),
          },
          { coins: calcUserPoints }
        );
        const getUpdatedUser = await User.findOne({ email });
        return res
          .status(201)
          .json({ msg: "bid placed successfully", getUpdatedUser });
      }
    } else {
      return res
        .status(400)
        .json({ msg: "You don't have enough coin to place bid" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports.findWinningNumber = async (req, res) => {
  const { email } = req.body;
  try {
    const currentDate = new Date().toLocaleDateString();
    const getUserDetail = await User.findOne({ email });
    const getUserBidDetail = await Bid.findOne({
      userId: ObjectId(getUserDetail._id),
      date: currentDate,
    });
    const bidNumberArray = getUserBidDetail.bidNumber;
    const bidValueArray = getUserBidDetail.bid;
    const list2 = new Array();
    for (var i = 1; i <= 100; i++) {
      if (!bidNumberArray.includes(i)) {
        list2.push(i);
      }
    }
    const rand = list2[Math.floor(Math.random() * list2.length)];
    if (rand !== undefined) {
      return res.status(200).json(rand);
    } else {
      const lowestValue = Math.min(...bidValueArray);
      const getIndex = bidValueArray.indexOf(lowestValue);
      return res.status(200).json(bidNumberArray[getIndex]);
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
