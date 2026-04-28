const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema(
  {
    treeId: { type: mongoose.Schema.Types.ObjectId, ref: "Tree", required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Node", default: null, index: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    notes: { type: String, default: "", maxlength: 4000 },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "solid"],
      default: "not_started",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    pos: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Node", nodeSchema);
