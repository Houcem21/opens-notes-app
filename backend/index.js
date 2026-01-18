// backend/index.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// OpenShift often injects PORT; default to 8080 (common in platforms)
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory store (MVP). Will be replaced by DB later.
let notes = [];

// Health check (useful for OpenShift readiness probes)
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Get all notes
app.get("/notes", (req, res) => {
  res.status(200).json(notes);
});

// Create a note
app.post("/notes", (req, res) => {
  const { title, content } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({
      error: "Missing required fields: title, content",
    });
  }

  const newNote = {
    id: Date.now().toString(), // simple MVP id
    title: String(title),
    content: String(content),
    createdAt: new Date().toISOString(),
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

// Delete a note by id
app.delete("/notes/:id", (req, res) => {
  const { id } = req.params;

  const before = notes.length;
  notes = notes.filter((n) => n.id !== id);

  // If nothing was removed, return 404 (cleaner for frontend)
  if (notes.length === before) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(200).json({ ok: true });
});

// Optional: clear all notes (handy for testing) — remove later if you want
// app.delete("/notes", (req, res) => {
//   notes = [];
//   res.status(200).json({ ok: true });
// });

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
