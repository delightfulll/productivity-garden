# 🌱 Productivity Garden

> A beautiful productivity app that helps you tend to your tasks like a garden — nurture what matters, grow your habits, and compost the rest.

---

## ✨ Features

| | |
|---|---|
| 🌿 **Task Categories** | Organize tasks into Watering, Sunlight & Composting |
| 🔥 **Streaks** | Track your daily consistency and build momentum |
| 📅 **Calendar View** | Visualize your schedule at a glance |
| 🎯 **Focus Timer** | Stay locked in with a built-in focus session |
| 🧑‍🌾 **Profile & Stats** | Garden level, XP, wins, and activity log |
| 🖱️ **Drag & Drop** | Reorder tasks with smooth animations |
| ⚙️ **Settings** | Personalize your garden experience |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety across the codebase |
| **Vite** | Fast dev server & build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Animations & drag-and-drop |
| **React Router v7** | Client-side navigation |
| **React Icons** | Icon library |
| **FullCalendar** | Interactive calendar component |
| **React Modal** | Accessible modals |
| **React Timer Hook** | Focus session timer |
| **tsParticles** | Particle effects |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **TypeScript** | Type-safe backend |
| **PostgreSQL** | Primary database |
| **node-postgres (pg)** | Postgres client |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin request handling |

---

## 🗂 Project Structure

```
productivity-garden/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── calendar.tsx
│   │   └── focus.tsx
│   ├── screens/           # Page-level components
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── styles/            # Global CSS
│   └── App.tsx
│
└── backend/
    ├── routes/
    │   ├── tasks.ts        # Task CRUD endpoints
    │   └── users.ts        # User + stats endpoints
    ├── db/
    │   └── schema.sql      # Database schema
    ├── db.ts               # Postgres pool
    └── api.ts              # Express server entry point
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd productivity-garden
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend && npm install
```

### 4. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Fill in your Postgres credentials
```

### 5. Set up the database

```bash
psql -U <your_user> -d <your_database> -f backend/db/schema.sql
```

### 6. Run the app

```bash
# Frontend (from root)
npm run dev

# Backend (from /backend)
npx tsx api.ts
```

---

## 🌐 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/users` | Create a user |
| `GET` | `/api/users/:id` | Get user profile |
| `PUT` | `/api/users/:id` | Update profile |
| `GET` | `/api/users/:id/stats` | Get stats & XP |
| `PUT` | `/api/users/:id/stats` | Update stats |
| `GET` | `/api/tasks?userId=` | Get all tasks |
| `GET` | `/api/tasks?userId=&category=` | Filter by category |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
