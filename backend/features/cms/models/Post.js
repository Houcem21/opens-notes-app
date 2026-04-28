const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    summary: { type: String, default: "" },
    content: { type: String, default: "" },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    category: { type: String, default: "general" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);