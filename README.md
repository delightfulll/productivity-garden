# Productivity Garden

A productivity app for goals, daily tasks, journaling, wins, and focus sessions—organized around a “garden” metaphor: water what matters, give sunlight to your priorities, and compost the rest.

---

## Features

| | |
| --- | --- |
| **Task categories** | Watering, Sunlight, and Composting columns with drag-and-drop reorder |
| **Day-aware tasks** | Tasks tied to calendar days; roll over to the next day |
| **Goals & backlog** | Goals, backlog, and milestone-style journey views |
| **Calendar** | Month view and time blocking |
| **Journal & wins** | Daily journal entries and wins tracking |
| **Focus & recovery** | Timer/focus tools and addictions/recovery screens |
| **Progress** | XP, levels, streaks, and profile stats |
| **Auth** | Register, login, and JWT-based sessions |

---

## Deployment architecture

| Layer | Service | Role |
| --- | --- | --- |
| **Frontend** | [Vercel](https://vercel.com) | Hosts the Vite/React app (static build, CDN, HTTPS). Connects to your Git repo for automatic deploys on push. |
| **Backend API** | **Google Cloud Run** (recommended) | Runs the Express API from the Docker image built in this repo. Scales to zero, HTTPS URL, `PORT` injected automatically. |
| **Container images** | **Artifact Registry** | Stores the backend Docker image produced by the build pipeline. |
| **Build pipeline** | **Cloud Build** | `cloudbuild.yaml` builds `backend/Dockerfile` and pushes the image to Artifact Registry (substitute your image name and run `gcloud builds submit`). |
| **Database** | **Cloud SQL for PostgreSQL** (or any Postgres) | The API expects PostgreSQL via `DB_*` env vars—Cloud SQL is the usual choice on GCP with a private or public IP and credentials in Secret Manager. |

**Frontend environment:** set `VITE_API_BASE_URL` in Vercel to your API’s public URL (no trailing slash), e.g. `https://your-service-xxxxx.run.app`, then redeploy so the client bundle points at production.

**Backend environment:** use `backend/.env.example` as a template (`PORT`, `DB_*`, `JWT_SECRET`). On Cloud Run, prefer Secret Manager for secrets and wire them as environment variables or mounted secrets.

---

## Tech stack

### Frontend

| | |
| --- | --- |
| **React** | UI |
| **TypeScript** | Shared typing |
| **Vite** | Dev server and production build |
| **Tailwind CSS v4** | Styling (`@tailwindcss/vite`) |
| **Framer Motion** | Animations and reorder |
| **React Router** | Client-side routing (`vercel.json` rewrites SPA routes) |

### Backend

| | |
| --- | --- |
| **Node.js + Express** | REST API |
| **TypeScript** | Compiled with `tsc`; local dev with `tsx` |
| **PostgreSQL** | Primary data store (`pg`) |
| **JWT + bcrypt** | Auth |

---

## Project structure

```
productivity-garden/
├── src/
│   ├── components/     # Sidebar, calendar, XP bar, modals, etc.
│   ├── context/        # Auth, stats, confirmations
│   ├── hooks/          # e.g. day query param
│   ├── lib/            # API client, dates, sounds
│   ├── screens/        # Home, Journal, Wins, Journey, Auth, …
│   ├── styles/         # CSS
│   └── App.tsx
├── backend/
│   ├── routes/         # tasks, users, auth, goals, journal, wins, …
│   ├── db/             # Pool, schema, migrations, XP helpers
│   ├── middleware/     # auth
│   ├── Dockerfile      # API container for Cloud Run / local Docker
│   └── api.ts          # Express entry
├── cloudbuild.yaml     # GCP Cloud Build → Artifact Registry
├── docker-compose.yml  # Optional: run API container locally
├── vercel.json         # SPA fallback for client-side routes
└── vite.config.js      # React + Tailwind plugins (must be in git for Vercel)
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/delightfulll/productivity-garden.git
cd productivity-garden
npm install
cd backend && npm install && cd ..
```

### 2. Database

Create a PostgreSQL database and apply the schema:

```bash
psql -U <user> -d <database> -f backend/db/schema.sql
```

Run additional SQL under `backend/db/migrations/` if your database predates newer columns (the API also runs some idempotent `ensure_*` steps on startup).

### 3. Backend environment

```bash
cp backend/.env.example backend/.env
# Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

### 4. Frontend environment (local)

Optional `.env` at the repo root for Vite:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
```

### 5. Run locally

```bash
# Terminal 1 — API (from backend/)
cd backend && npx tsx api.ts

# Terminal 2 — UI (from repo root)
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Docker (API only)

```bash
docker compose up --build
```

Uncomment `env_file` in `docker-compose.yml` or pass `DB_*` / `JWT_SECRET` so the container can reach Postgres.

---

## Scripts

| Command | Where | Purpose |
| --- | --- | --- |
| `npm run dev` | root | Vite dev server |
| `npm run build` | root | Production frontend build → `dist/` |
| `npm run build` | `backend/` | Compile TypeScript → `backend/dist/` |
| `npm start` | `backend/` | Run `node dist/api.js` after build |

---

## License

Private / personal use unless you add a license file.
