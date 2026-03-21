const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: "./backend/.env" });

const User = require("./backend/models/User");
const Internship = require("./backend/models/Internship");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/internhub";

mongoose.set("strictQuery", true); // avoid mongoose warnings

// ================= SAMPLE DATA =================

const sampleUsers = [
  {
    name: "Demo Student",
    email: "student@demo.com",
    password: "demo123",
    role: "student",
    bio: "Computer Science student passionate about web development",
    skills: ["React", "JavaScript", "Python", "Node.js"],
    location: "Bangalore, Karnataka",
  },
  {
    name: "TechCorp India",
    email: "company@demo.com",
    password: "demo123",
    role: "company",
    bio: "Leading technology company building the future",
    location: "Bangalore, Karnataka",
  },
  {
    name: "Admin User",
    email: "admin@internhub.com",
    password: "admin123",
    role: "admin",
  },
];

const sampleInternships = [
  {
    title: "Frontend Developer Intern",
    company: "TechCorp India",
    location: "Bangalore, Karnataka",
    type: "hybrid",
    category: "technology",
    description:
      "Join our frontend team to build amazing web applications using React.js and modern JavaScript. You will work on real products used by millions of users.",
    responsibilities: [
      "Build responsive UIs with React",
      "Collaborate with design team",
      "Write clean maintainable code",
      "Participate in code reviews",
    ],
    requirements: [
      "B.Tech/MCA in CS or related",
      "Knowledge of React.js",
      "Good JavaScript fundamentals",
      "Strong communication",
    ],
    skills: ["React", "JavaScript", "CSS", "HTML", "Git"],
    stipend: { amount: 15000, currency: "INR", type: "paid" },
    duration: "3 months",
    openings: 3,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    perks: ["Certificate", "PPO opportunity", "Flexible hours", "Mentorship"],
    isFeatured: true,
    applicationsCount: 45,
  },
  {
    title: "Digital Marketing Intern",
    company: "GrowthAgency",
    location: "Mumbai, Maharashtra",
    type: "remote",
    category: "marketing",
    description:
      "Help us grow our client brands through data-driven digital marketing strategies. Learn SEO, social media, and content marketing hands-on.",
    responsibilities: [
      "Manage social media accounts",
      "Create content for blogs and social",
      "Run Google and Meta ad campaigns",
      "Analyze performance metrics",
    ],
    requirements: [
      "Any graduation",
      "Interest in digital marketing",
      "Good writing skills",
      "Basic knowledge of social media",
    ],
    skills: [
      "SEO",
      "Social Media",
      "Google Ads",
      "Content Writing",  
      "Analytics",
    ],
    stipend: { amount: 10000, currency: "INR", type: "paid" },
    duration: "2 months",
    openings: 2,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    perks: ["Certificate", "Work from home", "Real campaign experience"],
    isFeatured: true,
    applicationsCount: 32,
  },
  {
    title: "UI/UX Design Intern",
    company: "DesignStudio",
    location: "Hyderabad, Telangana",
    type: "onsite",
    category: "design",
    description:
      "Create beautiful and intuitive user interfaces for our product suite. You will work closely with product managers and developers to ship great user experiences.",
    responsibilities: [
      "Design wireframes and prototypes",
      "Conduct user research",
      "Create design systems",
      "Present designs to stakeholders",
    ],
    requirements: [
      "Design degree or equivalent portfolio",
      "Proficiency in Figma",
      "Understanding of UX principles",
      "Portfolio required",
    ],
    skills: [
      "Figma",
      "Adobe XD",
      "Prototyping",
      "User Research",
      "Design Systems",
    ],
    stipend: { amount: 12000, currency: "INR", type: "paid" },
    duration: "3 months",
    openings: 1,
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    perks: ["Certificate", "Portfolio projects", "Design tools license"],
    isFeatured: false,
    applicationsCount: 28,
  },
  {
    title: "Data Science Intern",
    company: "Analytics Pro",
    location: "Pune, Maharashtra",
    type: "hybrid",
    category: "data",
    description:
      "Work on real ML projects and help businesses make data-driven decisions. You will build models, analyze large datasets, and present insights to leadership.",
    responsibilities: [
      "Build and train ML models",
      "Analyze large datasets",
      "Create data visualizations",
      "Present insights to team",
    ],
    requirements: [
      "B.Tech/M.Sc in CS, Statistics, or Math",
      "Python programming",
      "Knowledge of ML algorithms",
      "SQL basics",
    ],
    skills: [
      "Python",
      "Machine Learning",
      "SQL",
      "TensorFlow",
      "Data Visualization",
    ],
    stipend: { amount: 20000, currency: "INR", type: "paid" },
    duration: "6 months",
    openings: 2,
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    perks: [
      "Certificate",
      "High stipend",
      "PPO for top performers",
      "Learning budget",
    ],
    isFeatured: true,
    applicationsCount: 60,
  },
  {
    title: "Backend Developer Intern",
    company: "CloudSystems",
    location: "Noida, UP",
    type: "remote",
    category: "technology",
    description:
      "Build scalable backend services and APIs for our cloud platform. You will work with Node.js, Python, and AWS to build services handling millions of requests.",
    responsibilities: [
      "Build RESTful APIs",
      "Work with databases",
      "Write unit and integration tests",
      "Deploy on AWS",
    ],
    requirements: [
      "CS background",
      "Node.js or Python",
      "Database knowledge",
      "Git proficiency",
    ],
    skills: ["Node.js", "Python", "MongoDB", "PostgreSQL", "AWS", "REST APIs"],
    stipend: { amount: 16000, currency: "INR", type: "paid" },
    duration: "4 months",
    openings: 2,
    applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    perks: ["Certificate", "Remote work", "Cloud certification opportunity"],
    isFeatured: false,
    applicationsCount: 38,
  },
  {
    title: "Finance Analyst Intern",
    company: "HDFC Group",
    location: "Mumbai, Maharashtra",
    type: "onsite",
    category: "finance",
    description:
      "Gain hands-on experience in financial analysis, modelling, and investment research. Work with senior analysts on live projects.",
    responsibilities: [
      "Financial modelling and analysis",
      "Prepare investment reports",
      "Market research",
      "Support senior analysts",
    ],
    requirements: [
      "Finance/Economics background",
      "Excel proficiency",
      "Analytical mindset",
      "Attention to detail",
    ],
    skills: [
      "Excel",
      "Financial Modeling",
      "Bloomberg",
      "PowerPoint",
      "Financial Analysis",
    ],
    stipend: { amount: 25000, currency: "INR", type: "paid" },
    duration: "3 months",
    openings: 4,
    applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    perks: [
      "Certificate",
      "High stipend",
      "Networking opportunities",
      "PPO consideration",
    ],
    isFeatured: true,
    applicationsCount: 41,
  },
];

// ================= SEED FUNCTION =================

async function seed() {
  try {
    console.log("🔄 Connecting to MongoDB...");

    require('./backend/server.js'); // or your db connection file


    console.log("✅ Connected to MongoDB");

    // Clear old data
    await User.deleteMany({});
    await Internship.deleteMany({});
    console.log("🧹 Cleared existing data");

    // IMPORTANT: hash passwords manually
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      })),
    );

    const users = await User.insertMany(hashedUsers);

    console.log(`✅ Created ${users.length} users`);

    const companyUser = users.find((u) => u.role === "company");

    const internshipsWithCompany = sampleInternships.map((i) => ({
      ...i,
      companyId: companyUser._id,
    }));

    const internships = await Internship.insertMany(internshipsWithCompany);

    console.log(`✅ Created ${internships.length} internships`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📧 Demo accounts:");
    console.log("Student: student@demo.com / demo123");
    console.log("Company: company@demo.com / demo123");
    console.log("Admin: admin@internhub.com / admin123");
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seed();
