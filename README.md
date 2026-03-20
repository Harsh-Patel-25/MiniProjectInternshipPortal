# 🎯 InternHub - Complete Internship Management Platform

A full-stack MERN internship platform with advanced features including resume builder, company verification, analytics dashboard, and email notifications.

[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-blue.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Advanced Features](#-advanced-features)
- [Demo Accounts](#-demo-accounts)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### 👨‍🎓 For Students
- 🔍 **Advanced Search** - Browse internships with filters (location, type, category, stipend)
- 📋 **Easy Apply** - Apply with cover letter and resume
- 📊 **Application Tracking** - Real-time status updates (pending → reviewed → selected)
- 🔖 **Bookmark Internships** - Save opportunities for later
- 👤 **Profile Management** - Complete profile with skills, education, experience
- 📄 **Resume Builder** - Generate FAANG-level ATS-optimized resumes
- 📧 **Email Notifications** - Get notified when application status changes
- 📱 **Responsive Design** - Works on all devices

### 🏢 For Companies
- 📝 **Post Internships** - Create detailed internship listings
- 📨 **Manage Applications** - View and manage all applicants
- 🔄 **Status Updates** - Update application status with feedback
- 📊 **Company Dashboard** - Track internships and applications
- ✅ **Verification Badge** - Get verified with trust badges (Bronze/Silver/Gold/Platinum)
- 🎯 **Analytics** - Track views and application metrics
- 📧 **Auto Notifications** - Applicants notified of status changes

### 🛡️ For Admins
- 👥 **User Management** - Manage all users and roles
- 💼 **Internship Control** - Toggle active/featured status, delete any internship
- 📝 **Application Oversight** - View and manage all applications
- ✅ **Company Verification** - Verify companies and assign trust badges
- 📈 **Advanced Analytics** - Real-time metrics and interactive charts
- 🎯 **Trust Scoring** - Automatic 0-100 trust score calculation
- 📊 **Growth Tracking** - Monitor platform growth and trends

### 🔐 Security & General
- 🔒 **JWT Authentication** - Secure token-based auth
- 🛡️ **Role-Based Access Control** - Student/Company/Admin roles
- 🌙 **Modern UI/UX** - Clean, professional design
- ⚡ **Performance Optimized** - Fast and lightweight
- 📱 **Mobile Responsive** - Works perfectly on all devices

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js 18 | UI framework |
| | React Router v6 | Client-side routing |
| | Axios | HTTP client |
| | Recharts | Data visualization |
| | React Hot Toast | Notifications |
| | date-fns | Date formatting |
| **Backend** | Node.js 16+ | Runtime environment |
| | Express.js | Web framework |
| | JWT | Authentication |
| | Nodemailer | Email service |
| | PDFKit | PDF generation |
| **Database** | MongoDB | NoSQL database |
| | Mongoose ODM | Object modeling |
| **Styling** | Custom CSS | Styling |
| | CSS Variables | Theming |
| **Fonts** | Sora | Headings |
| | DM Sans | Body text |

---

## 📁 Project Structure

```
internhub/
├── backend/
│   ├── models/
│   │   ├── User.js              (User model with verification fields)
│   │   ├── Internship.js        (Internship model)
│   │   └── Application.js       (Application model)
│   ├── routes/
│   │   ├── auth.js              (Authentication routes)
│   │   ├── internships.js       (Internship CRUD)
│   │   ├── applications.js      (Application management + emails)
│   │   ├── users.js             (User management)
│   │   ├── companies.js         (Company routes)
│   │   ├── resume.js            (Resume generation)
│   │   ├── analytics.js         (Admin analytics)
│   │   └── verification.js      (Company verification)
│   ├── middleware/
│   │   └── auth.js              (JWT + role-based middleware)
│   ├── utils/
│   │   └── emailService.js      (Email notifications)
│   ├── server.js                (Express server)
│   └── .env                     (Environment variables)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js/.css       (Navigation with role-based menu)
│       │   ├── Footer.js/.css       (Footer)
│       │   └── InternshipCard.js    (Internship cards)
│       ├── pages/
│       │   ├── Home.js/.css         (Landing page)
│       │   ├── Auth.js/.css         (Login/Register)
│       │   ├── Internships.js       (Browse internships)
│       │   ├── InternshipDetail.js  (Internship details + apply)
│       │   ├── Dashboard.js         (Student dashboard)
│       │   ├── MyApplications.js    (Student applications)
│       │   ├── Profile.js           (Profile management)
│       │   ├── SavedInternships.js  (Saved internships)
│       │   ├── CompanyDashboard.js  (Company dashboard)
│       │   ├── PostInternship.js    (Post internship)
│       │   ├── AdminDashboard.js    (Admin dashboard with analytics)
│       │   └── ResumeBuilder.js/.css (Resume generator)
│       ├── context/
│       │   └── AuthContext.js       (Global auth state)
│       ├── utils/
│       │   └── api.js               (Axios instance)
│       ├── App.js                   (Main app with routes)
│       └── index.js                 (React entry point)
│
├── seed.js                      (Database seeder)
├── package.json                 (Dependencies)
└── README.md                    (This file)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- **MongoDB** (local installation) OR **MongoDB Atlas** (cloud)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/internhub.git
cd internhub
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# See "Environment Variables" section below

# Start backend server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

#### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend runs on:** `http://localhost:3000`

#### 4. Seed Database (Recommended)
```bash
# From root directory
node seed.js
```

This creates:
- 3 demo accounts (student, company, admin)
- 6 sample internships
- Sample applications

---

## 🔑 Demo Accounts

After running `seed.js`:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Student** | student@demo.com | demo123 | Browse, apply, resume builder |
| **Company** | company@demo.com | demo123 | Post internships, manage applications |
| **Admin** | admin@internhub.com | admin123 | Full platform control, analytics |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "company"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Internship Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/internships` | Get all internships (with filters) | No |
| GET | `/internships/:id` | Get single internship | No |
| POST | `/internships` | Create internship | Company only |
| PUT | `/internships/:id` | Update internship | Company only |
| DELETE | `/internships/:id` | Delete internship | Company only |
| GET | `/internships/featured` | Get featured internships | No |
| GET | `/internships/company/mine` | Get company's internships | Company only |

**Query Parameters for GET /internships:**
```
?search=developer
&location=Mumbai
&type=full-time
&category=Technology
&minStipend=10000
&sort=newest
&page=1
&limit=12
```

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/applications` | Apply for internship | Student only |
| GET | `/applications/my` | Get student's applications | Student only |
| DELETE | `/applications/:id` | Withdraw application | Student only |
| GET | `/applications/internship/:id` | Get internship applicants | Company only |
| PUT | `/applications/:id/status` | Update application status | Company only |

**Apply Request:**
```json
{
  "internshipId": "60d5ec49eb1b8a001f8e4567",
  "coverLetter": "I am very interested...",
  "resume": "https://drive.google.com/resume.pdf"
}
```

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update profile | Yes |
| POST | `/users/save-internship/:id` | Save/unsave internship | Student only |
| GET | `/users/saved-internships` | Get saved internships | Student only |

### Resume Builder Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/resume/generate` | Generate PDF resume | Student only |
| POST | `/resume/analyze` | Analyze resume (get score) | Student only |
| GET | `/resume/keywords` | Get FAANG keywords | Student only |

### Admin Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/overview` | Platform overview stats | Admin only |
| GET | `/analytics/trends` | Growth trends (7d/30d/90d) | Admin only |
| GET | `/analytics/companies` | Company analytics | Admin only |

### Verification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/verification/all` | Get all companies | Admin only |
| GET | `/verification/pending` | Get pending verifications | Admin only |
| POST | `/verification/:id/verify` | Verify company | Admin only |
| POST | `/verification/:id/reject` | Reject verification | Admin only |
| PUT | `/verification/:id/trust-score` | Update trust score | Admin only |

---

## 🎯 Advanced Features

### 1. 📄 Resume Builder

**FAANG-Level ATS-Optimized Resume Generation**

**Features:**
- ✅ Auto-generates from profile data
- ✅ 3 professional templates (Modern, Classic, Minimal)
- ✅ Live preview before download
- ✅ ATS-optimized format
- ✅ AI-powered scoring (0-100)
- ✅ FAANG keyword analysis
- ✅ Improvement suggestions

**Scoring Breakdown:**
- **Contact Info** (10 points) - Email, phone, location, LinkedIn, GitHub
- **Summary** (15 points) - Professional bio (30-100 words optimal)
- **Skills** (25 points) - Technical skills (10-15 recommended)
- **Education** (15 points) - Degree, institution, graduation year
- **Experience** (35 points) - Action verbs + quantifiable achievements

**Keywords Checked:**
- **Technical:** algorithms, system design, AWS, Docker, Kubernetes, CI/CD
- **Soft Skills:** leadership, collaboration, cross-functional, mentoring
- **Impact Verbs:** reduced, improved, increased, optimized, implemented

**Usage:**
1. Complete profile (60% minimum)
2. Go to `/resume-builder`
3. Choose template
4. Download professional PDF

---

### 2. ✅ Company Verification System

**Trust Badge & Verification Management**

**Verification Statuses:**
- 🔘 Unverified (default)
- ⏳ Pending (under review)
- ✅ Verified (approved)
- ❌ Rejected (declined)

**Trust Badges (Based on Score):**

| Score | Badge | Icon | Requirements |
|-------|-------|------|--------------|
| 90-100 | 💎 Platinum | Excellent profile + verified | 
| 75-89 | 🏆 Gold | Complete profile + verified |
| 60-74 | ⭐ Silver | Good profile + verified |
| 40-59 | 🥉 Bronze | Basic profile + verified |
| 0-39 | ⚪ None | Incomplete profile |

**Trust Score Calculation (0-100):**
- Basic info (30 pts): Email, phone, location, website, description, industry
- Documents (20 pts): Verification documents uploaded
- Profile (20 pts): Company size, founded year, LinkedIn, bio
- Verification (30 pts): Admin-verified status

**Admin Workflow:**
1. Company requests verification
2. Admin reviews in Verification tab
3. Admin verifies (enter trust score) or rejects (with reason)
4. Company receives email notification
5. Badge appears on company profile

---

### 3. 📈 Advanced Analytics Dashboard

**Real-Time Metrics & Insights**

**Overview Metrics:**
- Total users, companies, students
- Verification rate (% verified)
- Average trust score
- 30-day growth trends
- Active internships
- Pending applications

**Interactive Charts:**
- 📊 **Trust Badge Distribution** - Pie chart showing badge levels
- 📈 **Application Status** - Bar chart of application statuses
- 🏢 **Industry Distribution** - Top 10 industries by company count
- 📉 **Growth Trends** - Line charts for user growth (7d/30d/90d)

**Top Companies Table:**
- Ranked by total applications received
- Shows trust badge and verification status
- Internship count per company

**Filters & Views:**
- Filter by time period (7d, 30d, 90d)
- Filter companies by verification status
- Filter users by role
- Search and sort capabilities

---

### 4. 📧 Email Notification System

**Automated Email Notifications for Application Status Changes**

**Email Triggers:**
- Status changed from **Pending** to **Reviewed/Shortlisted/Interview/Selected/Rejected**
- Professional HTML email templates
- Company feedback included in email

**Email Templates:**

**Shortlisted:**
```
Subject: 🎯 You've been shortlisted for Software Engineer Intern!
- Orange badge
- Congratulatory message
- Next steps
- Company feedback
- "View Applications" button
```

**Selected:**
```
Subject: 🎉 Congratulations! You got the internship!
- Green badge
- Celebration message
- Onboarding info
```

**Interview:**
```
Subject: 📞 Interview scheduled for Software Engineer Intern
- Purple badge
- Interview details
- Preparation tips
```

**Rejected:**
```
Subject: Application update for Software Engineer Intern
- Professional message
- Encouragement to apply elsewhere
- Feedback from company
```

**Setup Required:**
- Gmail account with 2-Step Verification
- App password generated
- Environment variables configured (see below)

---

## 🔧 Environment Variables

### Backend `.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/internhub
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internhub

# JWT Secret (change in production)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (for notifications)
# Gmail Setup Instructions:
# 1. Enable 2-Step Verification in Google Account
# 2. Go to Security > App passwords
# 3. Generate app password for "Mail"
# 4. Use 16-character password below
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Frontend `.env` (Optional)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎨 Design System

**Color Palette:**
- **Primary:** `#5B4FE9` (Indigo)
- **Accent:** `#06B6D4` (Cyan)
- **Success:** `#10B981` (Green)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)
- **Dark:** `#1F2937` (Gray-800)
- **Light:** `#F9FAFB` (Gray-50)

**Typography:**
- **Headings:** Sora (Google Fonts)
- **Body:** DM Sans (Google Fonts)

**Components:**
- **Border Radius:** 12px (cards), 20px (buttons)
- **Shadows:** Subtle with purple tint
- **Spacing:** 8px base unit

---

## 📦 Deployment

### Backend (Railway / Render / Heroku)

1. **Push to Git:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Platform:**
   - Connect GitHub repository
   - Set root directory to `backend`
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Environment Variables:**
   - Set all variables from `.env`
   - Use MongoDB Atlas URI for production
   - Generate strong JWT_SECRET

### Frontend (Netlify / Vercel)

1. **Build Locally:**
```bash
cd frontend
npm run build
```

2. **Deploy:**
   - Connect GitHub repository
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Environment Variables:**
   - Set `REACT_APP_API_URL` to your backend URL

### Database (MongoDB Atlas)

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for allow all)
4. Get connection string
5. Replace in `MONGODB_URI` environment variable

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check if port 5000 is available
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Verify MongoDB is running
mongod --version
```

#### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm audit fix
```

#### Database Connection Failed
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check MONGODB_URI in `.env`
- For Atlas, verify IP whitelist and credentials

#### Email Notifications Not Sending
- Verify Gmail 2-Step Verification is enabled
- Check `EMAIL_PASS` is app password (16 chars), not regular password
- Test connection: Check backend console for "Email sent successfully"

#### Resume PDF Not Generating
```bash
# Verify PDFKit is installed
npm list pdfkit

# Reinstall if missing
npm install pdfkit
```

#### Charts Not Showing in Analytics
```bash
# Install Recharts
cd frontend
npm install recharts
```

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new student account
- [ ] Register new company account
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Protected routes redirect to login

**Student Features:**
- [ ] Browse internships with filters
- [ ] View internship details
- [ ] Apply to internship
- [ ] View my applications
- [ ] Withdraw application (pending only)
- [ ] Save/unsave internships
- [ ] Update profile
- [ ] Generate resume
- [ ] Receive email on status change

**Company Features:**
- [ ] Post new internship
- [ ] View posted internships
- [ ] View applications for internship
- [ ] Update application status
- [ ] Edit internship details
- [ ] Delete internship

**Admin Features:**
- [ ] View analytics dashboard
- [ ] See real-time metrics
- [ ] View interactive charts
- [ ] Verify companies
- [ ] Reject verification
- [ ] Update trust scores
- [ ] Manage users (change roles)
- [ ] Delete internships/users
- [ ] Manage all applications

---

## 🚀 Performance Optimization

**Implemented:**
- MongoDB indexing on frequently queried fields
- Pagination for large lists
- Lazy loading for charts
- React memo for expensive components
- Debounced search inputs

**Future Improvements:**
- Redis caching for analytics
- CDN for static assets
- Image optimization
- Code splitting
- Service workers

---

## 🔐 Security Best Practices

**Implemented:**
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Environment variables for secrets

**Production Recommendations:**
- Use HTTPS only
- Implement rate limiting
- Add helmet.js middleware
- Regular security audits
- Keep dependencies updated

---

## 📚 Resources

**Documentation:**
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/)

**Tools:**
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

**Coding Standards:**
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test before committing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Inspiration:** Various internship platforms
- **Icons:** Font Awesome
- **Charts:** Recharts library
- **Date Handling:** date-fns
- **Email Templates:** Custom HTML

---

## 📊 Project Stats

- **Total Lines of Code:** ~15,000+
- **Files:** 50+
- **Backend Routes:** 40+
- **React Components:** 25+
- **Database Models:** 3
- **Features:** 30+

---

## 🗺️ Roadmap

**Planned Features:**
- [ ] Real-time chat between students and companies
- [ ] Video interview integration
- [ ] AI-powered job recommendations
- [ ] Mobile app (React Native)
- [ ] Payment gateway for premium features
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics for companies
- [ ] Skill assessment tests
- [ ] Referral system

---

## 📞 Support

**Need Help?**

- 📧 Email: support@internhub.com
- 💬 Discord: [Join our community](#)
- 📖 Wiki: [Documentation](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/internhub/issues)

---

## ⭐ Star History

If you find this project helpful, please give it a star! ⭐

---

<div align="center">

**Built with ❤️ using React, Node.js, Express, and MongoDB**

[⬆ Back to Top](#-internhub---complete-internship-management-platform)

</div>
