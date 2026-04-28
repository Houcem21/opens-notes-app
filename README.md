# Notes Application 
### IT460 – Multi-Container Application Development (OpenShift)

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

## Communication Between Containers


---

## Data Persistence

---

## Testing and Validation

The application was tested in several scenarios:

- Creating, listing, and deleting notes
- Restarting backend pods
- Restarting the MongoDB pod
- Accessing the application in incognito and cache-less browser sessions
- Inspecting backend logs and health endpoints

All tests confirmed correct functionality and reliable persistence.

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

