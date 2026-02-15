# 🎯 InternHub - Find Your Dream Internship

A full-stack internship platform built with **React.js**, **Node.js + Express.js**, and **MongoDB**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (CRA), React Router v6, Axios, React Hot Toast |
| Backend | Node.js, Express.js, JWT Authentication |
| Database | MongoDB with Mongoose ODM |
| Styling | Custom CSS with CSS Variables |
| Fonts | Sora + DM Sans (Google Fonts) |

---

## 📁 Project Structure

```
internhub/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Internship.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── internships.js
│   │   ├── applications.js
│   │   ├── users.js
│   │   └── companies.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js / .css
│       │   ├── Footer.js / .css
│       │   └── InternshipCard.js / .css
│       ├── pages/
│       │   ├── Home.js / .css
│       │   ├── Internships.js / .css
│       │   ├── InternshipDetail.js / .css
│       │   ├── Auth.js / .css
│       │   ├── Dashboard.js / .css
│       │   ├── CompanyDashboard.js / .css
│       │   ├── PostInternship.js / .css
│       │   ├── Profile.js / .css
│       │   └── MyApplications.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   └── api.js
│       ├── styles/
│       │   └── App.css
│       ├── App.js
│       └── index.js
├── seed.js
└── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+ and npm
- MongoDB (local) OR MongoDB Atlas (cloud)

---

### Step 1: Clone / Download Project
```bash
# Navigate to the project folder
cd internhub
```

### Step 2: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file:
# MONGODB_URI=mongodb://localhost:27017/internhub   (local)
# OR
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/internhub  (Atlas)
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Start backend
npm run dev
```

### Step 3: Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

### Step 4: Seed Database (Optional but Recommended)
```bash
# From the root internhub folder
node seed.js
```

This creates demo accounts and sample internships.

---

## 🌐 Running the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## 🔑 Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | demo123 |
| Company | company@demo.com | demo123 |
| Admin | admin@internhub.com | admin123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Internships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/internships | Get all (with filters) |
| GET | /api/internships/:id | Get single |
| POST | /api/internships | Create (company only) |
| PUT | /api/internships/:id | Update (company only) |
| DELETE | /api/internships/:id | Delete (company only) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Apply for internship |
| GET | /api/applications/my | Student's applications |
| GET | /api/applications/internship/:id | Company's applications |
| PUT | /api/applications/:id/status | Update status |
| DELETE | /api/applications/:id | Withdraw application |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/profile | Get profile |
| PUT | /api/users/profile | Update profile |
| POST | /api/users/save-internship/:id | Save/unsave internship |
| GET | /api/users/saved-internships | Get saved |

---

## ✨ Features

### For Students
- 🔍 Browse & search internships with advanced filters
- 📋 Apply with cover letter and resume link
- 📊 Dashboard with application status tracking
- 🔖 Save/bookmark internships
- 👤 Complete profile with skills, education, experience
- 📱 Responsive on all devices

### For Companies
- 📝 Post detailed internship listings
- 📨 View and manage all applications
- 🔄 Update application status (pending → shortlisted → selected)
- 📊 Dashboard with stats and analytics
- 🎯 Track views and application count

### General
- 🔐 JWT-based authentication
- 🛡️ Role-based access control (student/company/admin)
- 🌙 Modern, responsive UI design
- ⚡ Fast and lightweight

---

## 🎨 Design System

- **Primary Color:** #5B4FE9 (indigo)
- **Accent:** #06B6D4 (cyan)
- **Typography:** Sora (headings) + DM Sans (body)
- **Border Radius:** 12px / 20px
- **Shadows:** Subtle with purple tint

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internhub
JWT_SECRET=internhub_secret_key_2024
NODE_ENV=development
```

### Frontend (optional .env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📦 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables on the platform
2. Set MONGODB_URI to your MongoDB Atlas connection string
3. Deploy the `backend` folder

### Frontend (Netlify/Vercel)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Deploy the `frontend` folder

---

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

---

*Built with ❤️ using React.js, Node.js, Express.js, and MongoDB*
