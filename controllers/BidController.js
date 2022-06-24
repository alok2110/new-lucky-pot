const { ObjectId } = require("mongodb");
const Bid = require("../models/Bid");
const User = require("../models/User");

module.exports.placeBid = async (req, res) => {
  const { email, bidPrice, bidNumber } = req.body;
  try {
    const getUserDetail = await User.findOne({ email });
    const currentDate = new Date().toLocaleDateString();
    let sum = 0;
    for(let i = 0; i< bidPrice.length; i++) {
      sum += bidPrice[i];
    }
    if (getUserDetail.coins >= sum) {
      const checkUserId = await Bid.findOne({
        userId: ObjectId(getUserDetail._id),
        date: currentDate,
      });
      if (checkUserId) {
        const updateData = await Bid.findOneAndUpdate(
          {
            date: currentDate,
          },
          {
            $push: {
              bid: bidPrice,
              bidNumber: bidNumber,
              bidingUserId: getUserDetail._id,
            },
          }
        );
        const calcUserPoints = getUserDetail.coins - sum;
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
          bidingUserId: getUserDetail._id,
        });
        const calcUserPoints = getUserDetail.coins - sum;
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
  try {
    const currentDate = new Date().toLocaleDateString();
    const getUserBidDetail = await Bid.findOne({
      date: currentDate,
    });
    const bidNumberArray = getUserBidDetail.bidNumber;
    const bidValueArray = getUserBidDetail.bid;
    const bidUserArray = getUserBidDetail.bidingUserId;
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
      const getWinnerData = await User.findOne({
        _id: ObjectId(bidUserArray[getIndex]),
      });
      return res.status(200).json({
        winner: getWinnerData,
        winningNumber: bidNumberArray[getIndex],
        winningPoint: bidValueArray[getIndex],
      });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

var data = "Real-Time Update 1";
var number = 120;

module.exports.server_sent_timer = async (req, res) => {
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
});

var interval = setInterval(function(){
    data = number;
    console.log("SENT: "+data);
    res.write("data: " + data + "\n\n")
    number--;
    if(data === 0) {
      data = 120;
    }
}, 1000);

// close
res.on('close', () => {
    clearInterval(interval);
    res.end();
});
}

// function randomInteger(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }  

