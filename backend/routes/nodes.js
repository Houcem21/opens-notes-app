const express = require("express");
const mongoose = require("mongoose");
const Node = require("../models/Node");
const Dependency = require("../models/Dependency");

const router = express.Router();

/**
 * Helper: validate ObjectId
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

/**
 * Helper: collect all descendant node ids (subtree)
 */
async function collectSubtreeIds(rootId) {
  const ids = new Set([String(rootId)]);
  const queue = [String(rootId)];

  while (queue.length) {
    const current = queue.shift();
    const children = await Node.find({ parentId: current }, { _id: 1 }).lean();

    for (const c of children) {
      const cid = String(c._id);
      if (!ids.has(cid)) {
        ids.add(cid);
        queue.push(cid);
      }
    }
  }

  return Array.from(ids);
}

/**
 * GET /trees/:treeId/nodes
 * List all nodes in a tree (frontend will build hierarchy)
 */
router.get("/trees/:treeId/nodes", async (req, res) => {
  try {
    const { treeId } = req.params;
    if (!isValidObjectId(treeId)) return res.status(400).json({ error: "Invalid treeId" });

    const nodes = await Node.find({ treeId }).sort({ createdAt: 1 }).lean();

    const formatted = nodes.map((n) => ({
      id: String(n._id),
      treeId: String(n.treeId),
      parentId: n.parentId ? String(n.parentId) : null,
      title: n.title,
      notes: n.notes || "",
      status: n.status,
      priority: n.priority,
      pos: n.pos || { x: 0, y: 0 },
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("GET /trees/:treeId/nodes failed:", err);
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

/**
 * POST /nodes
 * Create a node
 * Body: { treeId, parentId?, title }
 */
router.post("/nodes", async (req, res) => {
  try {
    const { treeId, parentId = null, title } = req.body || {};

    if (!treeId || !isValidObjectId(treeId)) {
      return res.status(400).json({ error: "Invalid or missing treeId" });
    }
    if (parentId !== null && parentId !== undefined && !isValidObjectId(parentId)) {
      return res.status(400).json({ error: "Invalid parentId" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Missing required field: title" });
    }

    const created = await Node.create({
      treeId,
      parentId: parentId ? parentId : null,
      title: String(title).trim(),
    });

    res.status(201).json({
      id: String(created._id),
      treeId: String(created.treeId),
      parentId: created.parentId ? String(created.parentId) : null,
      title: created.title,
      notes: created.notes || "",
      status: created.status,
      priority: created.priority,
      pos: created.pos || { x: 0, y: 0 },
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (err) {
    console.error("POST /nodes failed:", err);
    res.status(500).json({ error: "Failed to create node" });
  }
});

/**
 * PATCH /nodes/:id
 * Update node fields (rename, notes, status, priority)
 */
router.patch("/nodes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid node id" });

    const allowed = ["title", "notes", "status", "priority", "parentId", "pos"];
    const updates = {};
    for (const k of allowed) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
    }

    if (updates.title !== undefined) {
      if (!String(updates.title).trim()) return res.status(400).json({ error: "Title cannot be empty" });
      updates.title = String(updates.title).trim();
    }

    if (updates.notes !== undefined) {
      if (!String(updates.notes).trim()) return res.status(400).json({ error: "Notes cannot be empty" });
      updates.notes = String(updates.notes).trim();
    }

    if (updates.parentId !== undefined) {
      // we won't use reparenting in UI yet, but API can support it
      if (updates.parentId === null || updates.parentId === "") {
        updates.parentId = null;
      } else if (!isValidObjectId(updates.parentId)) {
        return res.status(400).json({ error: "Invalid parentId" });
      }
    }

    if (updates.status !== undefined) {
      const ok = ["not_started", "in_progress", "solid"];
      if (!ok.includes(updates.status)) return res.status(400).json({ error: "Invalid status" });
    }

    if (updates.priority !== undefined) {
      const ok = ["low", "medium", "high"];
      if (!ok.includes(updates.priority)) return res.status(400).json({ error: "Invalid priority" });
    }

    if (updates.pos !== undefined) {
      const x = Number(updates.pos?.x);
      const y = Number(updates.pos?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return res.status(400).json({ error: "Invalid pos (need numeric x,y)" });
      }
      updates.pos = { x, y };
    }

    const updated = await Node.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Node not found" });

    res.status(200).json({
      id: String(updated._id),
      treeId: String(updated.treeId),
      parentId: updated.parentId ? String(updated.parentId) : null,
      title: updated.title,
      notes: updated.notes || "",
      status: updated.status,
      priority: updated.priority,
      pos: updated.pos || { x: 0, y: 0 },
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error("PATCH /nodes/:id failed:", err);
    res.status(500).json({ error: "Failed to update node" });
  }
});

/**
 * DELETE /nodes/:id?cascade=true
 * Cascade deletes subtree + removes dependencies touching those nodes
 */
router.delete("/nodes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid node id" });

    const cascade = String(req.query.cascade || "true") === "true";

    const node = await Node.findById(id).lean();
    if (!node) return res.status(404).json({ error: "Node not found" });

    if (cascade) {
      const subtreeIds = await collectSubtreeIds(id);

      // delete deps where either end is in subtree
      await Dependency.deleteMany({
        treeId: node.treeId,
        $or: [{ fromNodeId: { $in: subtreeIds } }, { toNodeId: { $in: subtreeIds } }],
      });

      // delete nodes
      await Node.deleteMany({ _id: { $in: subtreeIds } });
    } else {
      // non-cascade: only delete node if no children
      const childrenCount = await Node.countDocuments({ parentId: id });
      if (childrenCount > 0) return res.status(409).json({ error: "Node has children. Use cascade=true." });

      await Dependency.deleteMany({
        treeId: node.treeId,
        $or: [{ fromNodeId: id }, { toNodeId: id }],
      });

      await Node.deleteOne({ _id: id });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE /nodes/:id failed:", err);
    res.status(500).json({ error: "Failed to delete node" });
  }
});

module.exports = router;
