const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Tree", treeSchema);
