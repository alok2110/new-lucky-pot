const { model, Schema } = require("mongoose");
const bidSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
    bidNumber: {
      type: Array,
      required: true,
    },
    bid: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("bid", bidSchema);
