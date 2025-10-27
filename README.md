#  QuickPoll — Real-Time Polling App

QuickPoll is a **real-time polling application** that allows users to create polls, vote, and instantly see live updates.  
It is built using a **FastAPI backend** and a **Next.js + TypeScript frontend**, with **WebSocket** support for live interactions.

---

###  System Components

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Frontend** | Next.js + TypeScript + TailwindCSS | Interactive UI for polls and voting. Handles WebSocket events for live results. |
| **Backend** | FastAPI | REST API for poll creation, vote handling, and WebSocket connections for broadcasting real-time results. |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Stores polls, options, and vote counts. |
| **WebSockets** | FastAPI `WebSocket` | Enables instant updates to all connected clients when a new vote occurs. |
| **Deployment** | Docker / Docker Compose | Containerized for consistent deployment. |

---

###  Data Flow
1. **Frontend** sends requests to FastAPI backend (`/polls`, `/votes`) via REST.
2. **Backend** stores or retrieves data from the database.
3. When a new vote is cast, the backend:
   - Updates the database.
   - Broadcasts updated poll results to all connected clients via **WebSocket**.
4. **Frontend** WebSocket connection (`useWebSocket`) receives real-time updates and re-renders results instantly.

---

##  Run the Project Locally

###  Prerequisites
- [Python 3.9+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- (optional) [Docker](https://www.docker.com/)

---

###  Option 1 — Run Locally (for Development)

#### 1️. Backend (FastAPI)
cd backend
python -m venv .venv
.venv\Scripts\activate       # (Windows)
# source .venv/bin/activate  # (Mac/Linux)

pip install -r app/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
 Server running at → http://127.0.0.1:8000
API Docs → http://127.0.0.1:8000/docs

2️. Frontend (Next.js)
cd ../frontend
npm install
npm run dev
 Frontend running at → http://localhost:3000

3️. Connect Both
Make sure backend URL in frontend/lib/api.ts is:


export const API_BASE = "http://127.0.0.1:8000";
If needed, enable CORS in backend main.py:


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Option 2 — Run Using Docker Compose
If you have docker-compose.yml:


cd quickpoll
docker-compose up --build
Access:

Backend → http://localhost:8000

Frontend → http://localhost:3000

 Research & APIs / Resources Used
Resource	Purpose
FastAPI Docs – https://fastapi.tiangolo.com/	Framework for REST + WebSocket backend
SQLAlchemy ORM – https://www.sqlalchemy.org/	Database modeling and CRUD layer
Next.js Docs – https://nextjs.org/docs	Frontend React framework with SSR support
TailwindCSS – https://tailwindcss.com/	Utility-first CSS styling
TypeScript – https://www.typescriptlang.org/	Type-safe frontend development
WebSockets (FastAPI)	Real-time communication between backend and clients
Docker – https://docs.docker.com/	Containerization for consistent deployment

Future Improvements
Authentication (JWT-based)

Persistent storage with PostgreSQL + SQLAlchemy migrations

Poll sharing via unique links

Analytics dashboard for poll results

