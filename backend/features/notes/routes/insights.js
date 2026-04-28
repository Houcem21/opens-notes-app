const express = require("express");
const mongoose = require("mongoose");
const Node = require("../models/Node");
const Dependency = require("../models/Dependency");

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

/**
 * Rule:
 * fromNodeId requires toNodeId
 * => fromNodeId is BLOCKED if any required toNodeId is not status === "solid"
 */
router.get("/trees/:treeId/insights", async (req, res) => {
  try {
    const { treeId } = req.params;
    if (!isValidObjectId(treeId)) return res.status(400).json({ error: "Invalid treeId" });

    const [nodesRaw, depsRaw] = await Promise.all([
      Node.find({ treeId }).lean(),
      Dependency.find({ treeId, type: "requires" }).lean(),
    ]);

    // Map nodes by id for quick lookup
    const nodesById = new Map(nodesRaw.map((n) => [String(n._id), n]));

    // Build requirements map: from -> [to...]
    const reqMap = new Map(); // fromId -> toIds[]
    for (const d of depsRaw) {
      const fromId = String(d.fromNodeId);
      const toId = String(d.toNodeId);
      if (!reqMap.has(fromId)) reqMap.set(fromId, []);
      reqMap.get(fromId).push(toId);
    }

    const blocked = [];
    const unblocked = [];

    for (const n of nodesRaw) {
      const id = String(n._id);
      const reqs = reqMap.get(id) || [];

      // if no requirements -> unblocked
      if (reqs.length === 0) {
        unblocked.push(id);
        continue;
      }

      // blocked if any requirement not solid (or missing)
      const isBlocked = reqs.some((toId) => {
        const depNode = nodesById.get(String(toId));
        return !depNode || depNode.status !== "solid";
      });

      if (isBlocked) blocked.push(id);
      else unblocked.push(id);
    }

    // Helper format for returning node summary
    const formatNode = (id) => {
      const n = nodesById.get(String(id));
      if (!n) return null;
      return {
        id: String(n._id),
        treeId: String(n.treeId),
        parentId: n.parentId ? String(n.parentId) : null,
        title: n.title,
        status: n.status,
        priority: n.priority,
        updatedAt: n.updatedAt,
      };
    };

    // next actions: unblocked + not solid, prioritized
    const nextActions = unblocked
      .map(formatNode)
      .filter(Boolean)
      .filter((n) => n.status !== "solid")
      .sort((a, b) => {
        const pr = { high: 0, medium: 1, low: 2 };
        const da = pr[a.priority] ?? 9;
        const db = pr[b.priority] ?? 9;
        if (da !== db) return da - db;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      })
      .slice(0, 10);

    res.status(200).json({
      treeId,
      counts: {
        nodes: nodesRaw.length,
        deps: depsRaw.length,
        blocked: blocked.length,
        unblocked: unblocked.length,
      },
      blocked: blocked.map(formatNode).filter(Boolean),
      unblocked: unblocked.map(formatNode).filter(Boolean),
      nextActions,
    });
  } catch (err) {
    console.error("GET /trees/:treeId/insights failed:", err);
    res.status(500).json({ error: "Failed to compute insights" });
  }
});

module.exports = router;
