🚀 Job Portal 
A full-stack job portal application built using Node.js, Express, MongoDB, and React.
Supports user authentication (JWT), job posting, job applications, and file uploads.

📌 Features
>👤 User & Employer Authentication
Register & Login using JWT
Separate access for job seekers & employers
Persistent login using HTTP-only tokens

💼 Job Management
Employers can create, update, and delete jobs
Job seekers can browse and apply for jobs
Resume upload using Multer

🔍 Search & Filter
Search jobs by title, skills, or company
Filter by location, salary, or job type

📁 Resume Upload
Accepts PDF, DOCX
Secure file handling

🏗️ Tech Stack
>Frontend
React (CRA)
Axios
React Router DOM

>Backend
Node.js
Express.js
MongoDB + Mongoose
Multer (file uploads)
JSON Web Tokens (JWT)

📁 Project Structure
job-portal/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api/
    │   └── App.js
    └── package.json

⚙️ Installation & Setup (Windows / PowerShell)
1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/job-portal.git
cd job-portal

🗄️ Backend Setup
2️⃣ Create MongoDB data directory (only once)
New-Item -ItemType Directory -Force -Path C:\data\db

3️⃣ Start MongoDB
mongod --ipv6 --bind_ip_all --setParameter diagnosticDataCollectionEnabled=false

4️⃣ Install backend dependencies
cd backend
npm install

5️⃣ Create .env file
Copy from .env.example and update:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job_portal
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

6️⃣ Start backend
npm run dev

🎨 Frontend Setup
1️⃣ Install frontend dependencies
cd ../frontend
npm install

2️⃣ Start React app
npm start
Frontend runs at: http://localhost:3000
Backend runs at: http://localhost:5000

🔌 API Endpoints (Quick Preview)
Auth
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login & get JWT
GET	/api/auth/me	Get logged-in user
Jobs
Method	Endpoint	Description
GET	/api/jobs	Get all jobs
POST	/api/jobs	Create a job (Employer only)
GET	/api/jobs/:id	Job details

🧪 Optional: Admin Seeder
Use only in development:
node backend/hash.js
node backend/updateAdmin.js

🛠️ Troubleshooting
MongoDB "db not found"
Create directory:
New-Item -ItemType Directory -Force -Path C:\data\db
Port 5000 already used
netstat -ano | findstr :5000
taskkill /PID <PID> /F
CORS error
Check your backend .env:
FRONTEND_URL=http://localhost:3000



👨‍💻 Author
POKALA PAVAN NAGA MANIKANTA
GitHub: https://github.com/pokalapavan2004
Email: pavanpokala2004@gmail.com