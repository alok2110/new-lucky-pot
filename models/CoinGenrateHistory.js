const { model, Schema } = require("mongoose");
const coinGenrateHistorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    coin: {
      type: Number,
      required: true,
    },
    genrateDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("coinGenrateHistory", coinGenrateHistorySchema);
