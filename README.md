# Omnexis Research Agent 🔬

**Professional Research Powered by Multi-Agent NVIDIA AI**

Omnexis Research Agent is a full-stack deep research platform that uses 6 specialized NVIDIA NIM AI agents working in sequence to generate professional, fact-verified research reports on any topic.

---

## 🚀 Features

- **6 Specialized AI Agents** — Planner → Query Generator → Research Analyst → Fact Verifier → Report Writer → Reviewer
- **NVIDIA NIM Only** — Powered exclusively by Llama 3.3 70B and Nemotron 70B via NVIDIA NIM APIs
- **Real-Time Progress** — Live agent tracking with percentage progress and stage updates
- **Confidence Scoring** — Every report includes a verified confidence score
- **PDF Export** — Download professional PDF reports
- **Research History** — Search, view, and manage all past research sessions
- **100% Free** — No subscriptions, no payments, no ads
- **Mobile-First** — Fully responsive design optimized for Android

---

## 📁 Project Structure

```
omnexis-research-agent/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # SQLite schema + init
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   ├── agents/
│   │   └── pipeline.py         # 6-agent research pipeline (NVIDIA NIM)
│   └── routers/
│       ├── auth.py             # JWT auth (register/login/me)
│       ├── research.py         # Research start/status/report/PDF endpoints
│       └── history.py          # Research history CRUD
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx             # Router + AuthProvider
        ├── index.css           # Global styles + animations
        ├── main.tsx
        ├── hooks/
        │   └── useAuth.tsx     # Auth context hook
        ├── pages/
        │   ├── LandingPage.tsx     # Hero + agent showcase
        │   ├── AuthPage.tsx        # Login + Register
        │   ├── ResearchPage.tsx    # Research interface + live progress
        │   ├── ReportPage.tsx      # Full report display
        │   └── HistoryPage.tsx     # Research history
        ├── types/
        │   └── index.ts        # TypeScript interfaces
        └── utils/
            └── api.ts          # API client utility
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- NVIDIA NIM API key (get free at https://build.nvidia.com)

### 1. Get NVIDIA API Key

1. Go to https://build.nvidia.com
2. Sign up for a free account
3. Navigate to API Keys and generate a key
4. The free tier includes sufficient credits for MVP testing

### 2. Backend Setup

```bash
# Navigate to backend
cd omnexis-research-agent/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your NVIDIA_API_KEY

# Start the server
python main.py
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Termux (Android) Setup

```bash
pkg update && pkg upgrade
pkg install python nodejs git
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup

```bash
cd omnexis-research-agent/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend at http://localhost:5173
```

### 4. Build for Production

```bash
# Frontend
cd frontend
npm run build        # Output in dist/

# Serve with nginx or any static host
# Backend: use gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🤖 AI Architecture

### Agent Pipeline

```
User Query
    ↓
[Agent 1: Planner] ─── Llama 3.3 70B
    Breaks query into research subtasks
    ↓
[Agent 2: Query Generator] ─── Nemotron 70B
    Creates optimized search strategies
    ↓
[Agent 3: Research Analyst] ─── Llama 3.3 70B
    Extracts insights from knowledge base
    ↓
[Agent 4: Fact Verifier] ─── Nemotron 70B
    Cross-checks evidence, assigns confidence
    ↓
[Agent 5: Report Writer] ─── Llama 3.3 70B
    Generates structured professional report
    ↓
[Agent 6: Reviewer] ─── Nemotron 70B
    Refines clarity and completeness
    ↓
Final Research Report (with confidence score)
```

### NVIDIA Models Used

| Agent | Model | Purpose |
|-------|-------|---------|
| Planner | `meta/llama-3.3-70b-instruct` | Strategic planning |
| Query Generator | `nvidia/llama-3.1-nemotron-70b-instruct` | Query optimization |
| Research Analyst | `meta/llama-3.3-70b-instruct` | Deep analysis |
| Fact Verifier | `nvidia/llama-3.1-nemotron-70b-instruct` | Verification |
| Report Writer | `meta/llama-3.3-70b-instruct` | Report generation |
| Reviewer | `nvidia/llama-3.1-nemotron-70b-instruct` | Quality review |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |

### Research
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/research/start` | Start research pipeline |
| GET | `/api/research/status/{id}` | Get session status + agent logs |
| GET | `/api/research/progress/{id}` | SSE stream for live progress |
| GET | `/api/research/report/{id}` | Get completed report JSON |
| GET | `/api/research/report/{id}/pdf` | Download PDF report |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history/` | List research history (paginated + search) |
| DELETE | `/api/history/{id}` | Delete a session |

---

## 🗄️ Database Schema

```sql
users (id, email, password_hash, name, created_at)
research_sessions (id, user_id, query, status, progress, current_stage, created_at, completed_at)
research_reports (id, session_id, executive_summary, key_findings, detailed_analysis, limitations, references, confidence_score)
agent_logs (id, session_id, agent_name, status, output, started_at, completed_at)
```

---

## 🎨 Design System

- **Background**: `#050B14` (deep navy black)
- **Card**: `#0A1628` (dark navy)
- **Border**: `#1A2D4A`
- **Accent Blue**: `#00D4FF` (NVIDIA cyan)
- **Accent Green**: `#00FF88`
- **Font**: Inter (UI) + JetBrains Mono (code/data)

---

## 🚢 Deployment

### Free Tier Options
- **Backend**: Render.com (free tier), Railway, or Fly.io
- **Frontend**: Vercel (free), Netlify, or Cloudflare Pages
- **Database**: SQLite file (included) — upgrade to PostgreSQL for production scale

### Environment Variables
```
NVIDIA_API_KEY=nvapi-xxxx
JWT_SECRET=your-secret-key
DB_PATH=omnexis-research-agent.db
```

---

## 📱 Mobile (Android/Termux) Notes

The entire backend runs perfectly in Termux:
```bash
pkg install python
pip install fastapi uvicorn httpx bcrypt pyjwt pydantic fpdf2
python main.py
```

Frontend can be accessed from any browser on the same network.

---

## 🛣️ Roadmap

- [ ] Web search integration via Tavily/SerpAPI
- [ ] Multi-language report support
- [ ] Collaborative research sessions
- [ ] Custom report templates
- [ ] Email report delivery
- [ ] Research comparison tool

---

Built with ❤️ by Omnexis AI · Powered by NVIDIA NIM
