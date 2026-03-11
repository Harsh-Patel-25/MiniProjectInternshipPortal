# Resume Builder Feature - Installation Guide

## 🎯 Feature Overview

This adds a **FAANG-level ATS-optimized resume builder** to InternHub that:
- ✅ Generates professional PDF resumes from student profiles
- ✅ Analyzes resume content with AI-powered scoring (0-100)
- ✅ Suggests FAANG keywords and optimization tips
- ✅ Provides 3 professional templates (Modern, Classic, Minimal)
- ✅ Shows live preview before download
- ✅ ATS-friendly format (passes applicant tracking systems)

---

## 📦 Installation Steps

### Step 1 — Install Backend Dependencies

```bash
cd backend
npm install pdfkit
```

**What this does:** PDFKit generates professional PDF resumes programmatically

---

### Step 2 — Add Resume Route to Backend

**File:** `backend/routes/resume.js`

Copy the entire `resume.js` file from `/home/claude/resume-feature/backend/routes/resume.js` to your `backend/routes/` folder.

---

### Step 3 — Register Route in Server

**File:** `backend/server.js`

Add this line after your other route registrations:

```javascript
// Existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/companies', require('./routes/companies'));

// ✅ ADD THIS NEW LINE
app.use('/api/resume', require('./routes/resume'));
```

---

### Step 4 — Add Frontend Component

**Files to copy:**
1. Copy `ResumeBuilder.js` → `frontend/src/pages/ResumeBuilder.js`
2. Copy `ResumeBuilder.css` → `frontend/src/pages/ResumeBuilder.css`

---

### Step 5 — Add Route to App.js

**File:** `frontend/src/App.js`

```javascript
import ResumeBuilder from './pages/ResumeBuilder';

// Inside <Routes>:
<Route path="/resume-builder" element={<ProtectedRoute roles={['student']}><ResumeBuilder /></ProtectedRoute>} />
```

---

### Step 6 — Add Navbar Link (Optional)

**File:** `frontend/src/components/Navbar.js`

Inside the student navigation section:

```javascript
{user?.role === 'student' && (
  <>
    <Link to="/dashboard">Dashboard</Link>
    <Link to="/my-applications">Applications</Link>
    {/* ✅ ADD THIS */}
    <Link to="/resume-builder">Resume Builder</Link>
  </>
)}
```

---

### Step 7 — Update API Utility (if needed)

**File:** `frontend/src/utils/api.js`

If your API doesn't auto-configure, add:

```javascript
export const resumeAPI = {
  generate: (data) => api.post('/resume/generate', data, { responseType: 'blob' }),
  analyze: () => api.post('/resume/analyze'),
  getKeywords: () => api.get('/resume/keywords'),
};
```

---

## 🚀 Usage

### For Students:

1. **Complete Profile First**
   - Go to Profile page
   - Fill in: Education, Experience, Skills, Contact info
   - Profile must be at least 60% complete

2. **Access Resume Builder**
   - Navigate to `/resume-builder` or click "Resume Builder" in navbar
   - You'll see 3 tabs: Preview, Optimize, Templates

3. **Preview Tab**
   - See live preview of your resume
   - View profile completion stats
   - Check what your resume will look like

4. **Optimize Tab**
   - Click "Analyze My Resume"
   - Get a score out of 100
   - See section-by-section breakdown
   - Get suggestions for improvement
   - See FAANG keywords found/missing

5. **Templates Tab**
   - Choose from 3 templates:
     - **Modern** — Clean, professional (recommended for tech)
     - **Classic** — Traditional, conservative
     - **Minimal** — Simple, elegant
   - Click "Download Resume PDF"

---

## 🎨 Features Explained

### ATS Optimization
- **Keyword scanning** — Checks for FAANG-level technical terms
- **Action verb detection** — Looks for impact verbs (Led, Implemented, Optimized)
- **Quantification check** — Ensures metrics are present (30%, $10k, 2x faster)
- **Format compliance** — Uses standard fonts, no images, simple structure

### Scoring System (out of 100)
- **Contact Info** (10 points) — Email, phone, location, LinkedIn, GitHub
- **Summary** (15 points) — Professional bio, 30-100 words optimal
- **Skills** (25 points) — Technical skills, 10-15 recommended
- **Education** (15 points) — Degree, institution, years
- **Experience** (35 points) — Action verbs + quantifiable achievements

### FAANG Keywords Database
Three categories:
1. **Technical** — algorithms, system design, AWS, Docker, microservices
2. **Soft Skills** — leadership, collaboration, cross-functional
3. **Impact** — reduced, improved, increased, optimized, implemented

---

## 📝 Example Resume Output

```
┌─────────────────────────────────────────────────┐
│           JOHN DOE                              │
│   john@email.com • +1234567890 • San Francisco │
│          LinkedIn • GitHub • Portfolio          │
├─────────────────────────────────────────────────┤
│                                                 │
│   PROFESSIONAL SUMMARY                          │
│   Full-stack developer with 3 years experience │
│   building scalable web applications...        │
│                                                 │
│   EDUCATION                                     │
│   Stanford University — BS Computer Science     │
│   2018 - 2022                                   │
│                                                 │
│   TECHNICAL SKILLS                              │
│   Programming: JavaScript, Python, Java         │
│   Frameworks: React, Node.js, Express          │
│   Tools: AWS, Docker, Git, MongoDB             │
│                                                 │
│   EXPERIENCE                                    │
│   Software Engineer — Google       2022-Present │
│   • Reduced API latency by 40% using Redis     │
│   • Implemented CI/CD pipeline for 50+ services│
│   • Led team of 5 engineers in microservices   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Profile Incomplete" Error
**Solution:** Complete your profile to at least 60%
- Add at least 1 education entry
- Add at least 1 experience/project
- Add at least 5 skills

### PDF Download Not Working
**Check:**
1. Backend route is registered in `server.js`
2. PDFKit is installed: `npm list pdfkit`
3. Check browser console for errors
4. Try different browser

### Resume Looks Blank
**Issue:** Profile data not loading
**Solution:**
- Refresh the page
- Check if logged in as student
- Verify profile has data in Profile page

### Analysis Shows 0 Score
**Cause:** User has no profile data
**Solution:** Fill in education, skills, experience in Profile page

---

## 🎯 FAANG Resume Best Practices (Built-In)

The system enforces these rules:
1. ✅ **Keep it 1 page** — PDF is auto-formatted to fit
2. ✅ **Use action verbs** — Analyzer checks for them
3. ✅ **Quantify everything** — Scoring penalizes missing numbers
4. ✅ **Standard formatting** — No images, tables, columns
5. ✅ **ATS-friendly** — Simple fonts, no graphics, keyword-rich
6. ✅ **Reverse chronological** — Most recent experience first

---

## 📊 API Endpoints Added

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/resume/generate` | Generate PDF resume | Student |
| POST | `/api/resume/analyze` | Analyze resume content | Student |
| GET | `/api/resume/keywords` | Get FAANG keyword list | Student |

---

## 🔐 Security

- ✅ Student-only access (middleware protected)
- ✅ No file upload vulnerabilities (generates from DB)
- ✅ Rate limiting recommended (add if high traffic)
- ✅ PDF generated server-side (no client-side injection)

---

## 🚀 Future Enhancements (Optional)

1. **Multiple Resume Versions** — Save different versions for different roles
2. **Cover Letter Generator** — Auto-generate cover letters
3. **LinkedIn Import** — Import profile from LinkedIn
4. **AI Rewriting** — Suggest better phrasing using GPT
5. **Job Match Score** — Compare resume to job descriptions

---

## ✅ Testing Checklist

After installation, test:
- [ ] Navigate to `/resume-builder` (students only)
- [ ] See profile completion percentage
- [ ] Preview tab shows resume
- [ ] Optimize tab analyzes and shows score
- [ ] Templates tab allows selection
- [ ] Download button generates PDF
- [ ] PDF opens correctly and looks professional
- [ ] Analysis gives accurate score and suggestions

---

## 📞 Support

If you encounter issues:
1. Check all files are copied correctly
2. Verify PDFKit is installed
3. Restart backend server
4. Clear browser cache
5. Check browser console for errors

---

**That's it! Your resume builder is ready.** 🎉

Students can now generate FAANG-level resumes with one click.
