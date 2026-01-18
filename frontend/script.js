// frontend/script.js

// Local dev backend:
const API_BASE = "https://notes-backend-houcem-dmk-dev.apps.rm1.0a51.p1.openshiftapps.com";
// Later on OpenShift, you'll switch this to the backend Route URL.

const titleEl = document.getElementById("title");
const contentEl = document.getElementById("content");
const addBtn = document.getElementById("addBtn");
const refreshBtn = document.getElementById("refreshBtn");
const notesEl = document.getElementById("notes");
const errorEl = document.getElementById("error");

function setError(msg) {
  errorEl.textContent = msg || "";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchNotes() {
  setError("");
  notesEl.innerHTML = "Loading...";
  try {
    const res = await fetch(`${API_BASE}/notes`);
    if (!res.ok) throw new Error(`GET /notes failed (${res.status})`);
    const notes = await res.json();
    renderNotes(notes);
  } catch (err) {
    notesEl.innerHTML = "";
    setError(err.message);
  }
}

function renderNotes(notes) {
  if (!Array.isArray(notes) || notes.length === 0) {
    notesEl.innerHTML = "<p>No notes yet.</p>";
    return;
  }

  notesEl.innerHTML = notes
    .slice()
    .reverse()
    .map(
      (n) => `
      <div class="note">
        <div class="note-header">
          <strong>${escapeHtml(n.title)}</strong>
          <button data-id="${escapeHtml(n.id)}">Delete</button>
        </div>
        <p>${escapeHtml(n.content)}</p>
        <small>${escapeHtml(n.createdAt)}</small>
      </div>
    `
    )
    .join("");

  // Attach delete handlers
  notesEl.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => deleteNote(btn.getAttribute("data-id")));
  });
}

async function addNote() {
  setError("");
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();

  if (!title || !content) {
    setError("Please fill in both title and content.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const maybe = await res.json().catch(() => ({}));
      throw new Error(maybe.error || `POST /notes failed (${res.status})`);
    }

    titleEl.value = "";
    contentEl.value = "";
    await fetchNotes();
  } catch (err) {
    setError(err.message);
  }
}

async function deleteNote(id) {
  setError("");
  try {
    const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const maybe = await res.json().catch(() => ({}));
      throw new Error(maybe.error || `DELETE /notes/${id} failed (${res.status})`);
    }

    await fetchNotes();
  } catch (err) {
    setError(err.message);
  }
}

addBtn.addEventListener("click", addNote);
refreshBtn.addEventListener("click", fetchNotes);

// Initial load
fetchNotes();
