const express = require("express");
const mongoose = require("mongoose");
const Dependency = require("../models/Dependency");
const Node = require("../models/Node");

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

/**
 * GET /trees/:treeId/deps
 * List all dependencies for a tree
 */
router.get("/trees/:treeId/deps", async (req, res) => {
  try {
    const { treeId } = req.params;
    if (!isValidObjectId(treeId)) return res.status(400).json({ error: "Invalid treeId" });

    const deps = await Dependency.find({ treeId }).sort({ createdAt: 1 }).lean();

    const formatted = deps.map((d) => ({
      id: String(d._id),
      treeId: String(d.treeId),
      fromNodeId: String(d.fromNodeId),
      toNodeId: String(d.toNodeId),
      type: d.type,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("GET /trees/:treeId/deps failed:", err);
    res.status(500).json({ error: "Failed to fetch dependencies" });
  }
});

async function wouldCreateCycle(treeId, fromNodeId, toNodeId) {
  // Adding edge: from -> to
  // Cycle exists if there is already a path: to => ... => from
  // because then to can reach from, and adding from->to closes the loop.

  const deps = await Dependency.find({ treeId, type: "requires" }, { fromNodeId: 1, toNodeId: 1 }).lean();

  // adjacency: a -> [b...]
  const adj = new Map();
  for (const d of deps) {
    const a = String(d.fromNodeId);
    const b = String(d.toNodeId);
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }

  const start = String(toNodeId);
  const target = String(fromNodeId);

  const seen = new Set([start]);
  const stack = [start];

  while (stack.length) {
    const cur = stack.pop();
    const nexts = adj.get(cur) || [];
    for (const nx of nexts) {
      const nxs = String(nx);
      if (nxs === target) return true;
      if (!seen.has(nxs)) {
        seen.add(nxs);
        stack.push(nxs);
      }
    }
  }

  return false;
}


/**
 * POST /deps
 * Body: { treeId, fromNodeId, toNodeId }
 * Meaning: fromNodeId requires toNodeId
 */
router.post("/deps", async (req, res) => {
  try {
    const { treeId, fromNodeId, toNodeId } = req.body || {};

    if (!treeId || !isValidObjectId(treeId)) {
      return res.status(400).json({ error: "Invalid or missing treeId" });
    }
    if (!fromNodeId || !isValidObjectId(fromNodeId)) {
      return res.status(400).json({ error: "Invalid or missing fromNodeId" });
    }
    if (!toNodeId || !isValidObjectId(toNodeId)) {
      return res.status(400).json({ error: "Invalid or missing toNodeId" });
    }
    if (String(fromNodeId) === String(toNodeId)) {
      return res.status(400).json({ error: "A node cannot depend on itself" });
    }

    // Ensure both nodes exist and belong to the same tree
    const [fromNode, toNode] = await Promise.all([
      Node.findById(fromNodeId).lean(),
      Node.findById(toNodeId).lean(),
    ]);

    if (!fromNode || !toNode) {
      return res.status(404).json({ error: "fromNodeId or toNodeId not found" });
    }
    if (String(fromNode.treeId) !== String(treeId) || String(toNode.treeId) !== String(treeId)) {
      return res.status(400).json({ error: "Both nodes must belong to the same treeId" });
    }

    const cycle = await wouldCreateCycle(treeId, fromNodeId, toNodeId);
    if (cycle) {
      return res.status(409).json({ error: "Dependency would create a cycle" });
    }

    // Create dependency (unique index prevents duplicates)
    const created = await Dependency.create({
      treeId,
      fromNodeId,
      toNodeId,
      type: "requires",
    });

    res.status(201).json({
      id: String(created._id),
      treeId: String(created.treeId),
      fromNodeId: String(created.fromNodeId),
      toNodeId: String(created.toNodeId),
      type: created.type,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (err) {
    // Handle duplicate edge nicely
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Dependency already exists" });
    }
    console.error("POST /deps failed:", err);
    res.status(500).json({ error: "Failed to create dependency" });
  }
});

/**
 * DELETE /deps/:id
 */
router.delete("/deps/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid dependency id" });

    const result = await Dependency.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Dependency not found" });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE /deps/:id failed:", err);
    res.status(500).json({ error: "Failed to delete dependency" });
  }
});

module.exports = router;
