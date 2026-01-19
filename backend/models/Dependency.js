const mongoose = require("mongoose");

const dependencySchema = new mongoose.Schema(
  {
    treeId: { type: mongoose.Schema.Types.ObjectId, ref: "Tree", required: true, index: true },

    // fromNodeId requires toNodeId
    fromNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "Node", required: true, index: true },
    toNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "Node", required: true, index: true },

    type: { type: String, enum: ["requires"], default: "requires" },
  },
  { timestamps: true, versionKey: false }
);

// prevent duplicates (same edge twice)
dependencySchema.index({ treeId: 1, fromNodeId: 1, toNodeId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Dependency", dependencySchema);
