# Smart Feedback Analytics for Faculty Evaluation

Full-stack rewrite: **React (Vite)** frontend, **Node.js + Express + TypeScript** backend, **PostgreSQL** database. Includes sentiment analysis and thematic categorization of student feedback, faculty/admin/academic-lead dashboards, and report generation groundwork.

## Stack
- Frontend: React 18, Vite, React Router, Axios, Recharts
- Backend: Node.js, Express, TypeScript, JWT auth, bcrypt
- Database: PostgreSQL (`pg` driver)
- NLP: `sentiment` package (swap in a custom/trained model later if needed)

## Project Structure
```
SMART-FEEDBACK-ANALYTICS/
├── backend/
│   └── src/
│       ├── config/      # db pool, migration, seed
│       ├── controllers/ # request handlers
│       ├── middleware/  # auth guards
│       ├── models/      # SQL queries
│       ├── routes/      # express routers
│       ├── services/    # sentiment + auth logic
│       ├── types/       # shared TS types
│       └── index.ts     # server entry
├── frontend/
│   └── src/
│       ├── pages/       # Login, Dashboard, FeedbackForm
│       ├── services/    # axios client
│       └── App.jsx
├── database/
│   └── schema.sql
└── docker-compose.yml   # local Postgres
```
