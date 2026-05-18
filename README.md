# ⚡ TaskFlow — DEPI Graduation Project

A productivity app with task management, Pomodoro timer, and gamification.

---

## 👥 Team

| Name     | Role                      |
|----------|---------------------------|
| عاصم     | Backend Developer         |
| محمد     | Backend + Login/Register  |
| كمال     | Frontend Core             |
| أرساني   | Frontend UI/UX            |
| ياسمين   | QA + Integration + Docs   |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in your MONGO_URI and JWT_SECRET
npm run dev               # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # runs on http://localhost:5173
```

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── controllers/      # business logic
│   ├── middleware/        # auth middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── server.js         # entry point
│
└── frontend/
    └── src/
        ├── api/           # axios instance
        ├── components/    # shared components (Navbar)
        ├── hooks/         # custom hooks
        ├── pages/         # one file per page
        │   ├── Login.jsx        ← محمد
        │   ├── Register.jsx     ← محمد
        │   ├── Dashboard.jsx    ← كمال
        │   ├── Pomodoro.jsx     ← أرساني
        │   ├── GamesZone.jsx    ← أرساني
        │   └── Chatbot.jsx      ← أرساني
        └── store/         # Zustand stores ← كمال
```

---

## 🔗 API Endpoints

| Method | Route                        | Description          |
|--------|------------------------------|----------------------|
| POST   | /api/auth/register           | Register user        |
| POST   | /api/auth/login              | Login user           |
| GET    | /api/auth/me                 | Get current user     |
| GET    | /api/tasks                   | Get all tasks        |
| POST   | /api/tasks                   | Create task          |
| PUT    | /api/tasks/:id               | Update task          |
| DELETE | /api/tasks/:id               | Delete task          |
| GET    | /api/tasks/stats             | Get task stats       |
| POST   | /api/pomodoro/start          | Start session        |
| PUT    | /api/pomodoro/:id/complete   | Complete session     |
| GET    | /api/pomodoro/history        | Get history          |
| GET    | /api/gamification/leaderboard| Leaderboard          |
| GET    | /api/gamification/my-stats   | My points & badges   |

---

## 🌿 Git Workflow

Each member works on their own branch:

```bash
git checkout -b feature/your-feature-name
# work...
git add .
git commit -m "feat: describe what you did"
git push origin feature/your-feature-name
# then open a Pull Request on GitHub
```
