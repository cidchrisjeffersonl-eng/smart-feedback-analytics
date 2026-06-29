# Smart Feedback Analytics for Faculty Evaluation

A full-stack capstone system that automates the collection, NLP-based analysis, and reporting of student feedback for faculty evaluation — with AI-assisted intervention recommendations when performance trends turn negative.

**Stack:** React (Vite) · Node.js / Express / TypeScript · PostgreSQL · Ollama (local LLM)

---

## ✨ Features

- **Sentiment analysis & thematic categorization** — every feedback comment is automatically scored (positive/neutral/negative) and tagged by theme (Teaching Clarity, Punctuality, Engagement, Fairness, Communication)
- **Role-based dashboards** — separate views for students, faculty, admins, and academic leads
- **AI-assisted intervention system** — automatically flags a faculty member when ratings drop or negative feedback spikes, and generates a suggested action plan using a local LLM (Ollama), with a rule-based fallback if the AI isn't available
- **Course & evaluation period management** — full CRUD for admins/academic leads
- **Department management** — track departments and faculty headcount
- **User management** — admins can view, change roles, or remove users
- **CSV export** — download a faculty member's feedback as a spreadsheet-ready report, with every export logged for audit purposes
- **Marketing homepage** — auto-rotating hero carousel, objectives/modules showcase, all content centralized in one editable config file
- **Security hardening** — input validation (Zod), rate limiting, parameterized queries (SQL injection-safe), CSV formula-injection sanitization, role re-verification on every privileged request

---

## 🗂 Project Structure
smart-feedback-analytics/
│
├── backend/
│   ├── src/
│   │   ├── config/              # Environment, DB, app configuration
│   │   │   ├── db.ts
│   │   │   ├── env.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── controllers/         # HTTP request handlers
│   │   │
│   │   ├── routes/              # Express route definitions
│   │   │
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── sentiment.service.ts
│   │   │   └── ai.service.ts
│   │   │
│   │   ├── repositories/        # Database access layer (replaces models)
│   │   │   ├── feedback.repository.ts
│   │   │   └── user.repository.ts
│   │   │
│   │   ├── middleware/          # Auth, validation, error handling
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── validators/          # Zod schemas
│   │   │
│   │   ├── utils/               # Helper functions
│   │   │   ├── logger.ts
│   │   │   ├── jwt.ts
│   │   │   └── formatters.ts
│   │   │
│   │   ├── types/               # Shared TypeScript types/interfaces
│   │   │
│   │   ├── constants/           # App constants
│   │   │
│   │   ├── jobs/                # Scheduled/background jobs (optional)
│   │   │
│   │   ├── app.ts               # Express app configuration
│   │   └── server.ts            # Server startup
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/              # Images, icons, logos
│   │   │
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI components
│   │   │   ├── layout/          # Navbar, Footer, Sidebar
│   │   │   └── feedback/        # Feature-specific components
│   │   │
│   │   ├── pages/               # Route pages
│   │   │
│   │   ├── services/            # API calls
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   └── feedbackService.js
│   │   │
│   │   ├── context/             # React Context providers
│   │   │
│   │   ├── hooks/               # Custom hooks
│   │   │
│   │   ├── utils/               # Helpers
│   │   │
│   │   ├── constants/           # Static values
│   │   │
│   │   ├── styles/              # Global styles/themes
│   │   │
│   │   ├── config/              # Frontend configs
│   │   │   └── siteContent.js
│   │   │
│   │   ├── routes/              # React Router configuration
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── tests/
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── docs/                        # API docs, architecture docs
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── package.json                 # Optional root workspace package

---

## 🚀 Getting Started

### 1. Start PostgreSQL
```bash
docker compose up -d
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate   # creates tables from database/schema.sql
npm run db:seed      # optional: sample faculty + admin accounts
npm run dev           # http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

### 4. Local AI for intervention suggestions
Install [Ollama](https://ollama.com/download), then:
```bash
ollama pull llama3.2
```
No API key needed — it runs entirely on your machine. If Ollama isn't running, the system automatically falls back to rule-based suggestions, so this step is optional.

---

## 🔑 Default Seeded Accounts
| Role | Email | Password |
|---|---|---|
| Faculty | `faculty@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a user |
| POST | `/api/auth/login` | Get JWT token |
| POST | `/api/feedback` | Submit feedback (auto sentiment + theme tagging, rate-limited) |
| GET | `/api/feedback/faculty/:facultyId` | Feedback list (filterable by course/period) |
| GET | `/api/feedback/faculty/:facultyId/analytics` | Sentiment summary, avg rating, top themes |
| GET | `/api/feedback/faculty/:facultyId/export` | CSV export (logged to `reports` table) |
| GET | `/api/feedback/student/:studentId` | A student's own feedback history |
| GET | `/api/feedback/admin/overview` | All-faculty aggregated stats (admin/academic_lead) |
| GET/POST/PUT/DELETE | `/api/courses` | Course management |
| GET/POST/PATCH/DELETE | `/api/periods` | Evaluation period management |
| GET/POST/PUT/DELETE | `/api/departments` | Department management |
| GET/PATCH/DELETE | `/api/admin/users` | User management (admin only) |
| GET/PATCH | `/api/interventions` | AI/rule-based intervention review (admin/academic_lead) |
| GET | `/api/interventions/faculty/:facultyId` | A faculty member's own flags (notes hidden) |

---

## 🛡 Security Notes

- All database queries use parameterized statements — no SQL injection surface
- JWT-based auth (not cookies) — not vulnerable to classic CSRF
- Role checked against the database on every privileged request, not just trusted from the JWT payload — revoking access takes effect immediately
- CSV exports sanitized against formula injection
- Rate limiting on auth (10/15min) and feedback submission (20/10min) endpoints

`JWT_SECRET` in `.env` **must** be changed to a real secret before any real deployment — it currently has a development fallback value.

---

## 📝 Editing Homepage Content

All homepage text and images live in `frontend/src/siteContent.js` — edit that one file (school/project name, hero slides, objectives, modules, footer info). No need to touch any component code.

---

## 👤 Author

Chris Jefferson Cid — BS Information Technology, Far Eastern University Roosevelt
