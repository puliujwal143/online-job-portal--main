# Online Job Recruitment and Application Portal

A **full-stack online job recruitment and application portal** built with **React, Node.js, Express, and MongoDB**.  
This platform allows employers to post jobs, and applicants to browse and apply for them with resume uploads. Authentication is handled securely with JWT.

##  Features
- User registration and login (JWT authentication)  
- Role-based dashboards: Admin, Employer, Applicant  
- Employers can create, update, and delete job listings  
- Applicants can browse jobs and submit applications  
- Resume file uploads handled via Multer  
- Responsive React frontend  
- Admin panel for managing users and overseeing applications  

##  Tech Stack
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Multer  
**Frontend:** React, Context API, Axios, CSS Modules  

##  Folder Structure
Online Job Recruitment and Application Portal/
├── backend/
│ ├── config/ # Database configuration
│ ├── middleware/ # Auth & file upload middleware
│ ├── models/ # Mongoose models: User, Job, Application
│ ├── routes/ # API routes: auth, jobs, users, applications
│ ├── utils/ # Utilities: email service, hash
│ ├── server.js # Backend entry point
│ └── package.json
├── frontend/
│ ├── public/ # index.html, favicon, static assets
│ ├── src/
│ │ ├── components/ # Admin, Employer, Applicant, Auth, Home
│ │ ├── context/ # AuthContext
│ │ ├── utils/ # API helper functions
│ │ ├── App.js
│ │ └── index.js
│ └── package.json
├── .gitignore
└── README.md

> **Note:** `node_modules/`, `uploads/`, and `backend/database/` are excluded via `.gitignore`.

##  Installation
### Prerequisites
- Node.js v16+  
- npm  
- MongoDB installed and running locally (`mongod`)  

### Backend Setup
bash
cd backend
npm install

1.Create .env file in backend/ based on .env.example:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job_portal
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

2.Start backend server:
npm run dev
Backend default port: 5000

3.Frontend Setup
cd frontend
npm install
npm start
Frontend default port: 3000
Visit http://localhost:3000 in your browser.

## Usage
Register as an Applicant or Employer
Employers can create, edit, and delete job postings
Applicants can view job details and apply with resume uploads
Admins can manage users and view all applications

## Environment Variables
### All sensitive information should be stored in .env:
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=
FRONTEND_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
Never commit .env or real passwords to GitHub.

## Admin Access (Development Only)
Admin email/password is configurable via .env
Admin dashboard allows management of users and monitoring job applications

## Contributing
Fork the repository
Create a new branch: git checkout -b feature/new-feature
Commit changes: git commit -m "Add new feature"
Push branch: git push origin feature/new-feature
Open a Pull Request

## License
This project is open-source and free to use for personal or educational purposes.

## Author
POKALA PAVAN NAGA MANIKANTA
GitHub: https://github.com/pokalapavan2004
Email: pavanpokala2004@gmail.com
# jobportal
