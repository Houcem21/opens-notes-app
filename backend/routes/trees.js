const express = require("express");
const Tree = require("../models/Tree");
const Node = require("../models/Node");
const Dependency = require("../models/Dependency");

const router = express.Router();

// GET /trees - list all trees
router.get("/", async (req, res) => {
  try {
    const trees = await Tree.find().sort({ createdAt: -1 }).lean();
    const formatted = trees.map((t) => ({ ...t, id: String(t._id) }));
    formatted.forEach((t) => delete t._id);
    res.status(200).json(formatted);
  } catch (err) {
    console.error("GET /trees failed:", err);
    res.status(500).json({ error: "Failed to fetch trees" });
  }
});

// POST /trees - create a tree
router.post("/", async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Missing required field: name" });
    }

    const created = await Tree.create({ name: String(name).trim() });

    res.status(201).json({
      id: String(created._id),
      name: created.name,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (err) {
    console.error("POST /trees failed:", err);
    res.status(500).json({ error: "Failed to create tree" });
  }
});

// DELETE /trees/:id?cascade=true - delete tree and optionally its nodes/deps
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cascade = String(req.query.cascade || "true") === "true";

    const tree = await Tree.findById(id);
    if (!tree) return res.status(404).json({ error: "Tree not found" });

    if (cascade) {
      await Dependency.deleteMany({ treeId: id });
      await Node.deleteMany({ treeId: id });
    }

    await Tree.deleteOne({ _id: id });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE /trees/:id failed:", err);
    res.status(500).json({ error: "Failed to delete tree" });
  }
});

module.exports = router;
