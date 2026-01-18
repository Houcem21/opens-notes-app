# Notes Application 
### IT460 – Multi-Container Application Development (OpenShift)

---

## Overview

This project is a multi-container Notes application developed for the IT460 course.  
The goal was to design, containerize, and deploy a real application on **Red Hat OpenShift**, while understanding how different services interact inside a container orchestration platform.

The application allows users to create, view, and delete notes. All data is stored persistently, meaning notes remain available even after containers or pods are restarted.

Beyond functionality, the project focuses on learning how OpenShift manages deployments, networking, storage, and scaling in a real environment.

---

## Application Architecture

The application is built following a microservices-style architecture. Each component is deployed independently and communicates through OpenShift-native mechanisms.

User Browser
|
v
Frontend (Route)
|
v
Backend API (Service)
|
v
MongoDB (Service + PersistentVolumeClaim)

This separation makes the system easier to maintain, debug, and scale.

---

## Components Description

### Frontend

The frontend is a static web application responsible for user interaction. It sends HTTP requests to the backend API and displays the returned data.  
It is exposed externally using an OpenShift Route.

### Backend

The backend is a Node.js application built with Express. It exposes a REST API that handles note creation, retrieval, and deletion.  
The backend is stateless and relies entirely on the database for persistence. Database configuration is provided through environment variables.

### Database

MongoDB is used to store notes. It runs as a separate container and uses an OpenShift PersistentVolumeClaim to ensure that data survives pod restarts and redeployments.

---

## Technologies Used

- Node.js and Express
- MongoDB with Mongoose
- Docker
- Red Hat OpenShift
- Quay.io container registry

---

## OpenShift Usage

The project makes use of several OpenShift features:

- Deployments to manage application pods and replicas
- Services for internal communication between containers
- Routes to expose the frontend and backend externally
- PersistentVolumeClaims for database storage
- Environment variables for runtime configuration
- Horizontal scaling through multiple backend replicas

Standard Kubernetes Deployments were used, as they are fully supported by OpenShift and align with current best practices.

---

## Containerization Strategy

Each component of the application runs in its own container. Images were built locally using Docker and pushed to Quay.io.  
All images were built for the `linux/amd64` architecture to match the OpenShift cluster nodes.

Example commands used during development:

```bash
docker build --platform=linux/amd64 -t quay.io/<username>/notes-backend .
docker push quay.io/<username>/notes-backend
```

---

## Communication Between Containers

The frontend communicates with the backend using HTTP through an OpenShift Service and Route.
The backend communicates with MongoDB using TCP through an internal OpenShift Service.
No IP addresses are hardcoded; service discovery is handled by OpenShift DNS.

---

## Data Persistence

MongoDB uses a PersistentVolumeClaim to store application data.
This ensures that notes remain available across:
- Backend pod restarts
- MongoDB pod restarts
- Application redeployments

Persistence was verified by manually deleting pods and confirming that data remained intact.

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

## Challenges Encountered

Several challenges were encountered during the project:

- Some container images could not be pulled directly due to registry restrictions in the OpenShift free trial.
- There was initial confusion between Builds, ImageStreams, and Deployments.
- The PersistentVolumeClaim remained in a Pending state until the first consumer pod was created.
- Browser caching caused the frontend to call a local API instead of the OpenShift backend route.
- Registry authentication issues required manual image management.

Each issue was resolved through debugging, experimentation, and consulting OpenShift documentation.

---

## Lessons Learned

This project highlighted several important lessons:

- OpenShift enforces stricter security and access rules than local Docker environments.
- Microservices should be loosely coupled and stateless.
- Persistence must be explicitly configured using PVCs.
- Services and internal DNS are essential for container communication.
- Browser caching can hide deployment configuration issues.
- Logs and events are critical tools when troubleshooting in OpenShift.

Overall, the project emphasized the importance of understanding the platform, not just the application code.

---

## Conclusion

This project successfully demonstrates the deployment of a multi-container application on Red Hat OpenShift using microservices principles.
The final system is functional, persistent, and scalable, and the development process provided valuable hands-on experience with container orchestration and cloud-native application deployment.