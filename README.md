# PitLane — AI-Powered Job Application Tracker

Track every job application you send, stay on top of follow-ups, and use AI to give yourself an edge — from resume analysis to interview prep.

Built with React + Vite, Node.js/Express, SQLite, and GitHub Models (`gpt-4o`).

---

## Features

- **Dashboard** — stat cards (Total, Interviews, Offers, Rejected), searchable/filterable applications table
- **Application detail** — full view with inline status updates, notes, and job description
- **AI: Resume Analyzer** — paste a resume + job description, get a match score (0–100), strengths, gaps, and action items
- **AI: Cover Letter Generator** — tailored cover letter per application using the JD and your background
- **AI: Interview Prep** — behavioral, technical, and culture questions with coaching hints
- **AI: Smart Insights** — pipeline-level nudges (stale apps, follow-up reminders, recommended next action)
- Data persists in a local SQLite file (`server/tracker.db`)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub Personal Access Token (PAT)

### 1. Get a GitHub PAT

Go to **github.com/settings/tokens** → Generate new token (classic) → no special scopes needed for GitHub Models. Copy the token.

> **Codespaces users:** `GITHUB_TOKEN` is already injected automatically — skip this step.

### 2. Set up environment

```bash
cp .env.example server/.env
# Open server/.env and set:
# GITHUB_TOKEN=github_pat_xxxx...
```

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Start the app

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001

In Codespaces, port 5173 will be automatically forwarded — click "Open in Browser" when prompted.

---

## Project Structure

```
application-tracker/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # Dashboard, AppDetail, Analyzer
│       ├── components/      # Layout, Modal, StatusBadge, ApplicationForm
│       └── api.js           # Fetch wrappers
├── server/                  # Node.js + Express backend
│   ├── routes/
│   │   ├── applications.js  # CRUD endpoints
│   │   └── ai.js            # AI endpoints (GitHub Models)
│   ├── db.js                # SQLite schema
│   └── index.js             # Express entry point
├── .env.example
└── package.json             # Root scripts (concurrently)
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run install:all` | Install all dependencies (root + server + client) |
| `npm run dev` | Start both server and client concurrently |
| `npm run build` | Build the client for production |

---

## Application Statuses

`Applied` → `In Review` → `Interview Scheduled` → `Offer` / `Rejected` / `Withdrawn`
