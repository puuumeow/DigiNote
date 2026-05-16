# DigiNote

DigiNote is a full-stack digital note sharing and marketplace platform developed for the Web Technology Lab Project.  
Users can upload, explore, buy, sell, and report study notes through a modern and responsive web application.

---

# Features

## User Features
- User Registration & Login
- JWT Authentication
- Upload Notes
- Download Free Notes
- Buy Premium Notes
- Search & Filter Notes
- Report Inappropriate Notes
- Notifications System
- User Profiles
- Responsive Dashboard

## Admin Features
- Admin Dashboard
- Manage Users
- Ban Users
- Remove Notes
- Review Reports
- Control Platform Activity

## Security Features
- Protected Routes using JWT
- Password Encryption
- Role-based Access Control
- Hidden Access for Banned Users

---

# Technologies Used

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JSON Web Token (JWT)
- bcrypt.js

## Other Tools
- Nodemon
- Multer
- dotenv
- CORS

---

# Project Structure

```bash
DigiNote/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── assets/
│   ├── pages/
│   ├── styles/
│   ├── scripts/
│   └── index.html
│
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/puuumeow/DigiNote.git
cd DigiNote
```

---

# Backend Setup

```bash
cd backend
npm install
npm install pdf-lib
npm install -D nodemon
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend server:

```bash
npm run dev
```

---

# Frontend Setup

Open the frontend files in browser or use Live Server.

Example:

```bash
frontend/index.html
```

---

# API Features

- Authentication API
- Notes API
- User API
- Report API
- Admin API
- Notification API

---

# Future Improvements

- Online Payment Integration (bKash/Nagad/Stripe)
- Real-time Chat System
- AI-based Note Recommendation
- Dark Mode
- Mobile Application

---

# Challenges Faced

- Authentication Handling
- File Upload Management
- Protected Routes
- Dashboard State Management
- Report Moderation System

---

# Learning Outcomes

Through this project we learned:
- Full Stack Web Development
- REST API Development
- MongoDB Database Design
- Authentication & Authorization
- Backend Architecture
- Git & GitHub Workflow

---

# Project Demonstration

https://youtu.be/LFZSv8lSzoc

---

# Author

Developed for Web Technology Lab Project.

Made with the help of AI-assisted development tools for learning and productivity purposes.

---

# License

This project is for educational purposes only.
