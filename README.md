# MediSuite Pharmacy — Production Setup Guide

A full-stack pharmacy e-commerce app: **React + Vite** frontend, **Express + Prisma + PostgreSQL** backend.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 7, Bootstrap 5, React Router 7 |
| Backend | Express 5, Prisma 6, PostgreSQL 16 |
| Auth | JWT (access token, 15 min expiry) |
| Email | Nodemailer (SMTP / Gmail) |
| Deployment | Docker Compose + Nginx |

---

## Quick Start (Local Development)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_ACCESS_SECRET, SMTP_* values in .env

npm install
npx prisma migrate dev
npx prisma generate
node prisma/seed-admin.js   # creates admin user
npm run dev                  # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api (default)

npm install
npm run dev                  # http://localhost:5173
```

---

## Production Deployment (Docker)

### 1. Create a `.env` file in the project root

```bash
cp backend/.env.example .env.docker
```

Fill in all required values:

```env
POSTGRES_USER=pharmacy_user
POSTGRES_PASSWORD=super-secure-password

JWT_ACCESS_SECRET=generate-64-char-random-string
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
VITE_API_BASE_URL=/api

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="MediSuite <your@gmail.com>"

RESET_CODE_PEPPER=another-long-random-string
RESET_TOKEN_SECRET=yet-another-long-string
```

> **Generate secrets:** `openssl rand -hex 32`

### 2. Build & run

```bash
docker compose --env-file .env.docker up -d --build
```

### 3. Seed admin

```bash
docker compose exec backend node prisma/seed-admin.js
```

App runs at `http://localhost` (port 80).

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | 64+ char secret for JWT signing |
| `JWT_ACCESS_EXPIRES_IN` | — | Default: `15m` |
| `FRONTEND_URL` | ✅ | Allowed CORS origin |
| `CORS_ORIGINS` | — | Comma-separated allowed origins; overrides `FRONTEND_URL` |
| `SMTP_HOST` | ✅ | SMTP server host |
| `SMTP_PORT` | — | Default: `587` |
| `SMTP_USER` | ✅ | SMTP username |
| `SMTP_PASS` | ✅ | SMTP password / app password |
| `MAIL_FROM` | ✅ | From address in emails |
| `RESET_CODE_PEPPER` | ✅ | Secret for password reset hashing |
| `RESET_TOKEN_SECRET` | ✅ | Secret for reset token JWT |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (e.g. `https://api.your-domain.com/api`) |

---

## Admin Panel

Navigate to `/admin` and log in with the seeded admin credentials.

**Admin features:**
- Dashboard with order stats
- Products (create, edit, delete, images, variants, discounts)
- Categories (nested)
- Brands (with logo upload)
- Hero slides (homepage carousel)
- Trending products picker
- Store info & settings

---

## Security Features (Production)

- **Helmet** — sets secure HTTP headers
- **Rate limiting** — 200 req/15min global, 20 req/15min on auth routes
- **CORS** — restricted to `CORS_ORIGINS` (or `FRONTEND_URL`) in production
- **Compression** — gzip on all responses
- **Graceful shutdown** — closes DB connections cleanly on SIGTERM
- **Error boundary** — prevents whole frontend from crashing on errors
- **JWT expiry check** — auto-logout on expired token at app startup

---

## Folder Structure

```
Pharmacy/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed-admin.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js     ← NEW
│   │   │   └── validate.middleware.js  ← NEW
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             ← axios instance + per-resource files
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── ErrorBoundary.jsx  ← NEW
│   │   │       └── Loader.jsx         ← NEW
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── NotFound.jsx           ← NEW
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── routes/
│   │   └── utils/
│   ├── Dockerfile
│   ├── nginx.conf           ← NEW
│   └── .env.example
├── docker-compose.yml       ← NEW
└── README.md
```
