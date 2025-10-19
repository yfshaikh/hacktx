# 🚗 Toyota Finance Coach — Backend

Smart backend for a real-time finance & leasing advisor that:

- Simulates loan vs. lease with clear assumptions
- Suggests budget-fit Toyota models
- Ingests mock banking via Capital One Nessie to give budget tips
- Includes what-if solvers and shareable quotes
- Speaks results using ElevenLabs TTS

> Front-end teammates can call these endpoints directly; everything is CORS-enabled.

---

## ✨ Features

- **Quotes**: Side-by-side finance vs lease calculations (`/api/coach/quote-ui`)
- **Explain + TTS**: Human-readable summary and MP3 speech
- **What-If**: Change down/term and compare deltas (text + audio)
- **Payment Solver**: Find down/term combos to hit a target monthly
- **Inventory Hints**: Toyota model suggestions within budget
- **Nessie Integration**: Customer spending summary + actionable savings tips
- **Shareable Quotes**: Encode/decode URL tokens for quick sharing
- **Telemetry**: Tiny in-memory events logger for demo analytics
- **Swagger Docs**: `/docs`
- **Routes Index**: `/api/debug/routes`

---

## ⚡ Quickstart

```bash
# 1) Clone
git clone <your-repo-url>
cd <repo>/backend

# 2) Python venv
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# 3) Install deps
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4) Environment
cp .env.example .env
# Fill in ELEVENLABS_API_KEY and ELEVEN_VOICE_ID at minimum.
# DEV_MODE=1 lets Nessie endpoints use demo data without an API key.

# 5) Run
python -m uvicorn main:app --reload --port 8000
# Open http://127.0.0.1:8000/docs

## 🌱 Environment
# Create backend/.env (or use .env.example):
# Core
DEV_MODE=1
ALLOWED_ORIGINS=http://localhost:5173

# ElevenLabs (required for TTS)
ELEVENLABS_API_KEY=YOUR_KEY
ELEVEN_VOICE_ID=YOUR_VOICE_ID

# Shareable quotes token secret (fallbacks to SUPABASE_JWT_SECRET if present)
DEMO_SHARE_SECRET=change-me

# Optional: Nessie
NESSIE_API_KEY= # optional in DEV_MODE
NESSIE_BASE=https://api.nessieisreal.com

# Optional: Supabase (not required for demo)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_JWT_SECRET=


---

## 📡 API Overview

### 🚘 Coach (Core UX)
- `POST /api/coach/quote-ui` → UI-ready object `{ best_loan, best_lease, assumptions, ... }`
- `POST /api/coach/explain` → Human-readable text explanation
- `POST /api/coach/speak-quote` → MP3 of explanation
- `POST /api/coach/what-if-ui` → Baseline vs modified + deltas
- `POST /api/coach/speak-what-if` → MP3 of what-if deltas
- `POST /api/coach/quote-ui-from-nessie/{customer_id}` → Same as `quote-ui` but uses Nessie data
- `POST /api/coach/quote-ui-from-nessie-with-tips/{customer_id}` → Applies Nessie savings tips to lower outflows
- `GET /api/coach/ping`

### 💳 Nessie (Mock Banking)
- `GET /api/nessie/customers`
- `GET /api/nessie/summary/{customer_id}`
- `GET /api/nessie/tips/{customer_id}` → `{ estimated_monthly_savings, suggestions[] }`
- `GET /api/nessie/ping`

### 🚙 Inventory / Advice / Calc
- `POST /api/inventory/suggest` → Toyota model hints with `est_monthly`
- `POST /api/advice/afford` → PTI/DTI proxy + financial tips
- `POST /api/calc/finance`
- `POST /api/calc/lease`

### 🧠 Optimize
- `POST /api/optimize/solve-payment` → Find down/term combos close to a target monthly

### 🔗 Share
- `POST /api/share/encode` → `{ token }`
- `GET /api/share/decode?token=...` → `{ request }`

### 🛠 Utilities
- `GET /api/debug/routes` → List all registered routes
- `GET /docs` → Swagger API docs
- `POST /api/events/track`
- `GET /api/events/recent`

---

## ✅ Smoke Tests (PowerShell)

Run these in `backend/` with venv active.

### 1. Quote UI

```powershell
$body = @{
  msrp=33000; sell_price=31500; state_tax_rate=0.0625;
  doc_fees=200; acquisition_fee=650; title_reg=250;
  rebates=1000; trade_in_credit=0; down_payment=2000;
  term_months=36; miles_per_year=12000; credit_score=700;
  target_body_style="suv"
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8000/api/coach/quote-ui" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json
```

### 2. Speak
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/coach/speak-quote" `
  -Method POST -ContentType "application/json" -Body $body -OutFile quote.mp3

Start-Process .\quote.mp3
```

### 3. Nessie (DEV_MODE demo data)
```powershell
Invoke-RestMethod "http://127.0.0.1:8000/api/nessie/customers" | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8000/api/nessie/summary/demo_customer_1" | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8000/api/nessie/tips/demo_customer_1" | ConvertTo-Json
```

### 4. Quote with Nessie + Tips
```powershell
Invoke-RestMethod "http://127.0.0.1:8000/api/coach/quote-ui-from-nessie-with-tips/demo_customer_1" `
  -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json
```

### 5. What-IF
```
$wi = @{ original = ($body | ConvertFrom-Json); delta_down = 1000; delta_term = 12 } | ConvertTo-Json -Depth 6

Invoke-RestMethod "http://127.0.0.1:8000/api/coach/what-if-ui" -Method POST -ContentType "application/json" -Body $wi | ConvertTo-Json
```

### 6. Payment Solver
```$solve = @{
  msrp=33000; sell_price=31500; state_tax_rate=0.0625;
  doc_fees=200; acquisition_fee=650; title_reg=250;
  rebates=1000; trade_in_credit=0; credit_score=700;
  target_monthly=400; down_min=0; down_max=6000; down_step=500; terms=@(36,48,60,72)
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8000/api/optimize/solve-payment" -Method POST -ContentType "application/json" -Body $solve | ConvertTo-Json
```

### 7. Share
```
$enc = Invoke-RestMethod "http://127.0.0.1:8000/api/share/encode" `
  -Method POST -ContentType "application/json" -Body (@{ request = ($body | ConvertFrom-Json) } | ConvertTo-Json -Depth 6)

$token = $enc.token

Invoke-RestMethod "http://127.0.0.1:8000/api/share/decode?token=$token" | ConvertTo-Json
```

On macOS/Linux, use curl -X POST ... -H "Content-Type: application/json" -d '...' equivalents.

## Architecture (open code to see structure)
[ Frontend (Vite/React) ]
        |
        v
    (CORS REST)
        |
  ┌───────────────────────────┐
  │  FastAPI Backend          │
  │  /api/coach/*             │  → finance vs lease, explain, speak, what-if
  │  /api/optimize/*          │  → payment solver
  │  /api/nessie/*            │  → spending summary & tips
  │  /api/inventory/*         │  → Toyota model hints
  │  /api/share/*             │  → encode/decode quote
  │  /api/events/*            │  → telemetry
  └───┬─────────┬───────────┬─┘
      │         │           │
      │         │           └─ ElevenLabs TTS (text→speech)
      │         └───────────── Capital One Nessie (mock banking)
      └─────────────────────── (Optional) Supabase (future persistence)

