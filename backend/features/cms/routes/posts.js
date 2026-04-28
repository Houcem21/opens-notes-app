const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// helper: slug generator
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /posts → public (nur published)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /posts/admin → alle posts
router.get("/admin", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /posts/:slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    }).lean();

    if (!post) return res.status(404).json({ error: "Not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /posts
router.post("/", async (req, res) => {
  try {
    const { title, content, summary, category, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const slug = slugify(title);
    const allowedStatuses = ["draft", "published"];
    const post = await Post.create({
      title,
      slug,
      content: content || "",
      summary: summary || "",
      category: category || "general",
      status: allowedStatuses.includes(status) ? status : "draft",
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PATCH /posts/:id
router.patch("/:id", async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.title) {
      update.slug = slugify(update.title);
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /posts/:id
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;