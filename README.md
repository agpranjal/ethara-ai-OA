# Inventory & Order Management System

Full-stack application for managing products, customers, and orders — built with React, FastAPI, and PostgreSQL.

## Tech Stack
- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL 15
- **Container**: Docker + Docker Compose

---

## Quick Start (Docker Compose)

```bash
# 1. Clone and enter project
git clone <repo-url>
cd inventory-management

# 2. Copy env file (optional — defaults work for local)
cp .env.example .env

# 3. Build and run
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set DATABASE_URL to your local Postgres
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:3000
```

The Vite dev server proxies API calls to `localhost:8000` automatically.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get order |
| DELETE | `/orders/{id}` | Cancel order |
| GET | `/dashboard/summary` | Dashboard stats |

Interactive Swagger UI: `http://localhost:8000/docs`

---

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders are rejected if stock is insufficient
- Creating an order automatically deducts inventory
- Cancelling an order restores inventory
- Order total is computed server-side from current product prices

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo, set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database and copy the `DATABASE_URL` into env vars
7. Set `ALLOWED_ORIGINS` to your Vercel frontend URL

Or use the included `render.yaml` for one-click deploy.

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

---

## Docker Hub

Build and push the backend image:
```bash
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest
```
