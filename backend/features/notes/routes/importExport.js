const express = require("express");
const mongoose = require("mongoose");
const Tree = require("../models/Tree");
const Node = require("../models/Node");
const Dependency = require("../models/Dependency");

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

/**
 * GET /trees/:treeId/export
 * Returns JSON: { tree, nodes, deps, exportedAt }
 */
router.get("/trees/:treeId/export", async (req, res) => {
  try {
    const { treeId } = req.params;
    if (!isValidObjectId(treeId)) return res.status(400).json({ error: "Invalid treeId" });

    const [tree, nodes, deps] = await Promise.all([
      Tree.findById(treeId).lean(),
      Node.find({ treeId }).lean(),
      Dependency.find({ treeId }).lean(),
    ]);

    if (!tree) return res.status(404).json({ error: "Tree not found" });

    res.status(200).json({
      exportedAt: new Date().toISOString(),
      version: 1,
      tree: {
        id: String(tree._id),
        name: tree.name,
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt,
      },
      nodes: nodes.map((n) => ({
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
      })),
      deps: deps.map((d) => ({
        id: String(d._id),
        treeId: String(d.treeId),
        fromNodeId: String(d.fromNodeId),
        toNodeId: String(d.toNodeId),
        type: d.type,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    console.error("GET /trees/:treeId/export failed:", err);
    res.status(500).json({ error: "Failed to export tree" });
  }
});

/**
 * POST /trees/import
 * Body: export JSON from /export
 * Creates a NEW tree with NEW ids, preserving parent/dep structure.
 */
router.post("/trees/import", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.tree || !Array.isArray(payload.nodes) || !Array.isArray(payload.deps)) {
      return res.status(400).json({ error: "Invalid import payload" });
    }

    // Create new tree
    const newTreeName = String(payload.tree.name || "Imported Tree").trim() || "Imported Tree";
    const createdTree = await Tree.create({ name: newTreeName });

    const oldToNewNodeId = new Map(); // oldId -> newId

    // 1) create nodes (without parentId first)
    const nodesToCreate = payload.nodes.map((n) => ({
      treeId: createdTree._id,
      parentId: null,
      title: String(n.title || "Untitled").trim() || "Untitled",
      notes: String(n.notes || ""),
      status: ["not_started", "in_progress", "solid"].includes(n.status) ? n.status : "not_started",
      priority: ["low", "medium", "high"].includes(n.priority) ? n.priority : "medium",
      pos: n.pos && Number.isFinite(Number(n.pos.x)) && Number.isFinite(Number(n.pos.y))
        ? { x: Number(n.pos.x), y: Number(n.pos.y) }
        : { x: 0, y: 0 },
    }));

    const createdNodes = await Node.insertMany(nodesToCreate);

    // map ids by index (stable because we used payload.nodes order)
    for (let i = 0; i < payload.nodes.length; i++) {
      oldToNewNodeId.set(String(payload.nodes[i].id), String(createdNodes[i]._id));
    }

    // 2) set parentId now that all nodes exist
    // build bulk updates
    const bulk = [];
    for (let i = 0; i < payload.nodes.length; i++) {
      const oldNode = payload.nodes[i];
      const oldParent = oldNode.parentId ? String(oldNode.parentId) : null;
      if (!oldParent) continue;

      const newId = oldToNewNodeId.get(String(oldNode.id));
      const newParentId = oldToNewNodeId.get(oldParent);

      if (newId && newParentId) {
        bulk.push({
          updateOne: {
            filter: { _id: newId },
            update: { $set: { parentId: newParentId } },
          },
        });
      }
    }
    if (bulk.length) await Node.bulkWrite(bulk);

    // 3) recreate deps with new node ids
    const depsToCreate = payload.deps
      .filter((d) => d.type === "requires") // keep it tight
      .map((d) => {
        const fromNew = oldToNewNodeId.get(String(d.fromNodeId));
        const toNew = oldToNewNodeId.get(String(d.toNodeId));
        if (!fromNew || !toNew || fromNew === toNew) return null;
        return {
          treeId: createdTree._id,
          fromNodeId: fromNew,
          toNodeId: toNew,
          type: "requires",
        };
      })
      .filter(Boolean);

    // insertMany can throw on duplicates; in imports duplicates are rare but handle safely
    if (depsToCreate.length) {
      try {
        await Dependency.insertMany(depsToCreate, { ordered: false });
      } catch (e) {
        // ignore duplicate insert errors during import
      }
    }

    res.status(201).json({
      ok: true,
      treeId: String(createdTree._id),
      name: createdTree.name,
      imported: {
        nodes: createdNodes.length,
        deps: depsToCreate.length,
      },
    });
  } catch (err) {
    console.error("POST /trees/import failed:", err);
    res.status(500).json({ error: "Failed to import tree" });
  }
});

module.exports = router;
