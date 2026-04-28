// backend/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Middleware
const adminAuth = require("./middleware/adminAuth");

// Notes
const treesRouter = require("./features/notes/routes/trees");
const nodesRouter = require("./features/notes/routes/nodes");
const depsRouter = require("./features/notes/routes/deps");
const insightsRouter = require("./features/notes/routes/insights");
const importExportRouter = require("./features/notes/routes/importExport");

// CMS
const postsRouter = require("./features/cms/routes/posts");

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// OpenShift often injects PORT; default to 8080 (common in platforms)
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/trees", treesRouter);
app.use(nodesRouter);
app.use(depsRouter);
app.use(insightsRouter);
app.use(importExportRouter);

// CMS
app.use("/posts", postsRouter);

// MongoDB connection (URL provided by OpenShift env var)
const MONGO_URL = process.env.MONGO_URL;

// Define Note schema + model
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Note = mongoose.model("Note", noteSchema);


// Health check (useful for OpenShift readiness probes)
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Get all notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).lean();
    // Convert _id to id for your frontend
    const formatted = notes.map((n) => ({ ...n, id: String(n._id) , _id: undefined }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error("GET /notes failed:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});


// Create a note
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        error: "Missing required fields: title, content",
      });
    }

    const created = await Note.create({
      title: String(title),
      content: String(content),
    });

    res.status(201).json({
      id: String(created._id),
      title: created.title,
      content: created.content,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error("POST /notes failed:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Delete a note by id
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Note.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE /notes/:id failed:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});


// Optional: clear all notes (handy for testing) — remove later if you want
// app.delete("/notes", (req, res) => {
//   notes = [];
//   res.status(200).json({ ok: true });
// });

async function start() {
  if (!MONGO_URL) {
    console.error("Missing MONGO_URL env var. Set it in OpenShift Deployment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

start();

