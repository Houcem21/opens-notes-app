# Internal CRM
### Useful tool for organizing company info

---

## Overview

---

## Application Architecture

---

## Components Description

### Frontend

React + Vite

### Backend

Supabase

### Database

Supabase
---

## Technologies Used

- Supabase
- React

---

## Testing and Validation


---

# Local Development (step-by-step)

## Steps

1) Clone the repo
git clone https://github.com/Houcem21/opens-notes-app.git
cd opens-notes-app

2) Start Supabase

Check it's running:


3) Run the frontend locally

cd frontend
nvm use 20
npm i
npm run dev


Open:

http://localhost:5173


## Typical update flow

When you change code locally:
Commit + push (optional but recommended)

---

# TO DO

Refactor these files:
src/api/posts.js
src/api/notes.js
src/api/tasks.js
src/api/storage.js
to use requireOk, requireData instead of "const { data, error }"

Continue refactoring