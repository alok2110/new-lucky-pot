const { model, Schema } = require("mongoose");
const resultDeclareSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("resultDeclare", resultDeclareSchema);
