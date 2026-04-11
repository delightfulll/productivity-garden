# 🌱 Productivity Garden

A productivity app I made because goalsumo got shut down and notion wasn't cutting it.

## **https://productivity-garden-pi.vercel.app/login**

## Features

| Feature              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| **Task categories**  | Watering, Sunlight, and Composting columns with drag-and-drop reorder |
| **Day-aware tasks**  | Tasks tied to calendar days; roll over to the next day                |
| **Goals & backlog**  | Goals, backlog, and milestone-style journey views                     |
| **Calendar**         | Month view and time blocking                                          |
| **Journal & wins**   | Daily journal entries and wins tracking                               |
| **Focus & recovery** | Timer/focus tools and addictions/recovery screens                     |
| **Progress**         | XP, levels, streaks, and profile stats                                |
| **Auth**             | Register, login, and JWT-based sessions                               |

---

## Deployment architecture

| Layer                | Service                      | Role                                                                                |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| **Frontend**         | **Vercel**                   | Hosts the Frontend(clientside)                                                      |
| **Backend API**      | **Google Cloud Run**         | Runs the Express API from the Docker image built                                    |
| **Container images** | **Artifact Registry**        | Build and depoloy the dockerimage into artificat registery, then ran with cloud run |
| **Database**         | **Cloud SQL for PostgreSQL** | Database deployed via CloudSQL                                                      |

---

## Tech stack

### Frontend

| Technology          | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| **React**           | UI                                             |
| **TypeScript**      | Programming Language with static type checking |
| **Vite**            | Dev server and production build                |
| **Tailwind CSS v4** | Styling                                        |
| **Framer Motion**   | Animations and reorder                         |
| **React Router**    | Client-side routing                            |

### Backend

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| **Node.js + Express** | REST API                           |
| **TypeScript**        | Typechecking Language              |
| **PostgreSQL**        | Database                           |
| **JWT + bcrypt**      | Auth                               |
| **Google Cloud**      | Cloud Deployment                   |
| **Docker**            | Containerization and Orchestration |

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
│   ├── Dockerfile      # API container
│   └── api.ts          # Express entry
├── vercel.json         # SPA fallback for client-side routes
└── vite.config.js      # React + Tailwind plugins (must be in git for Vercel)
```
