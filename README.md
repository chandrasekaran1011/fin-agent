# FinAgent OS

**Agentic Finance Intelligence Platform** — 4 live AI demos for CFOs and finance leaders, powered by LangChain Deep Agents.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 14 App                    │
│  Landing │ Dashboard (4) │ Demo Workflows (4)       │
├─────────────────────────────────────────────────────┤
│              API Routes (SSE Streaming)              │
│  /api/agents/{ar,cashflow,vendor,copilot}           │
│  /api/dashboard/{ar,cashflow,vendor,copilot}        │
├─────────────────────────────────────────────────────┤
│           Deep Agents (createDeepAgent)              │
│  AutoRecon │ CashSight │ VendorGuard │ BoardBrief   │
│  + Skills  │ + 3 Sub-  │ + Tools    │ + FAISS +    │
│  + HITL    │   agents  │            │   Subagents   │
├──────────┬──────────┬───────────────────────────────┤
│  Redis   │PostgreSQL│        FAISS                   │
│  Cache   │Structured│     Vector Search              │
│  Session │Data      │   (Documents, Invoices)        │
└──────────┴──────────┴───────────────────────────────┘
```

## The 4 Use Cases

| Module | Agent Name | Description |
|--------|-----------|-------------|
| AR Reconciliation | **AutoRecon** | Invoice-to-transaction matching with confidence scoring, discrepancy detection, and human-in-the-loop approval workflows |
| Cash Flow Prediction | **CashSight** | Multi-agent debate forecasting — 3 subagents (optimist, analyst, risk-assessor) produce consensus forecasts with scenarios |
| Vendor Risk Intelligence | **VendorGuard** | Payment behavior scoring, concentration risk analysis, and automated risk classification with actionable recommendations |
| CFO Co-Pilot | **BoardBrief** | Natural language queries over financial data with FAISS semantic search, inline charts, and cited board-ready narratives |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14, TypeScript (strict), React 18 |
| Agent Framework | `deepagents` (createDeepAgent), LangChain, LangGraph |
| LLM | Azure OpenAI / OpenAI (env-switched) |
| Databases | PostgreSQL (Prisma), Redis (ioredis), FAISS (faiss-node) |
| UI | Tailwind CSS, Framer Motion, Recharts, Radix UI |
| Streaming | Custom SSE via Next.js API routes |

## Database Roles

| Database | Purpose | Key Data |
|----------|---------|----------|
| PostgreSQL | Structured transactional data | Invoices, transactions, vendors, forecasts, agent logs, copilot sessions |
| Redis | Cache + session state | Dashboard KPI cache (5min TTL), agent session metadata |
| FAISS | Vector similarity search | Financial documents, invoice descriptions, forecast narratives |

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+
- **Redis** 7+
- **pnpm** (install via `npm install -g pnpm`)

## Setup

```bash
# 1. Clone and install
git clone <repo-url> finagent-os
cd finagent-os
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 3. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 4. Seed all databases (PostgreSQL + FAISS)
pnpm db:seed

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Edit `.env.local` with your values:

```bash
# LLM Provider — "azure" or "openai"
LLM_PROVIDER=azure

# Azure OpenAI (when LLM_PROVIDER=azure)
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# OpenAI (when LLM_PROVIDER=openai)
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Databases
DATABASE_URL=postgresql://postgres:password@localhost:5432/finagent
REDIS_URL=redis://localhost:6379
FAISS_INDEX_PATH=./data/faiss

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LLM_PROVIDER=azure
```

## LLM Provider Switching

Set `LLM_PROVIDER` in `.env.local`:

- `azure` — Uses Azure OpenAI (GPT-4o deployment + text-embedding-3-small)
- `openai` — Uses OpenAI API directly

The provider badge in the top-right of the UI updates automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed all data (vendors, invoices, transactions, documents, FAISS index) |
| `pnpm db:reset` | Reset DB and re-seed |
| `pnpm db:studio` | Open Prisma Studio |

## Routes

```
/                       Landing page (hero + 4 module cards)
/dashboard              Master CFO overview
/dashboard/ar           AR aging, match rates, open items
/dashboard/cashflow     Forecast charts, variance, burn rate
/dashboard/vendor       Risk heatmap, vendor table, alerts
/dashboard/copilot      Query history, insight feed, stats
/demo/ar-recon          AR agent interactive workflow
/demo/cashflow          Cash flow multi-agent debate
/demo/vendor-risk       Vendor risk deep scan
/demo/cfo-copilot       CFO chat interface
```

## Seed Data

The seed scripts create realistic Indian financial data:

- **50 vendors** — Indian company names across IT, Logistics, Manufacturing, Services, Utilities
- **500 invoices** — 350 clean matches, 75 amount mismatches, 50 date mismatches, 15 duplicates, 10 missing
- **~9,600 cash flow transactions** — 24 months, 4 business units, with planted anomalies
- **30 financial documents** — Policies, quarterly reports, vendor summaries, analyses
- **FAISS index** — All documents embedded for semantic search

### Planted Anomalies (for demos)

- Month 18: Q3 EBITDA drop of 35% in "south" business unit
- Month 12: Unusual capex spike in "corporate" (₹8Cr one-time)
- Months 20-22: Revenue growth acceleration in "north" (+28% YoY)
- Q4 every year: 20% seasonal revenue bump

## Conference Demo Script

| Step | Action | Duration |
|------|--------|----------|
| 1 | Landing page — show 4 modules, provider badge | 30 sec |
| 2 | Master dashboard — KPIs across all modules | 1 min |
| 3 | AR Recon demo — load 47 invoices, watch agent trace, approve flagged items | 2 min |
| 4 | Cash Flow demo — watch 3 agents debate, see consensus forecast + scenarios | 2 min |
| 5 | Vendor Risk demo — scan a critical vendor, see risk scorecard | 1.5 min |
| 6 | CFO Co-Pilot — ask "Why did EBITDA drop in Q3?", see FAISS retrieval + cited answer | 2 min |

## How FAISS Semantic Search Works

1. Financial documents (policies, reports, analyses) are embedded using `text-embedding-3-small`
2. Embeddings are stored in a local FAISS index at `./data/faiss/`
3. When the CFO Co-Pilot receives a query, it embeds the question and finds the top-5 most similar documents
4. The AR Recon agent also uses FAISS to find semantically similar past invoices for fuzzy matching
5. Results include similarity scores — only matches above 0.7 threshold are used

To rebuild the FAISS index: `pnpm db:seed` (runs `seed-faiss.ts` as the final step).

## Agent Architecture (Deep Agents)

Each agent uses `createDeepAgent` from the `deepagents` package with:

- **Tools** — Custom `tool()` definitions with Zod schemas for structured I/O
- **Skills** — `SKILL.md` files with domain knowledge (progressive disclosure)
- **Subagents** — Inline subagent definitions for parallel task delegation
- **Checkpointer** — `MemorySaver` for session persistence
- **Human-in-the-loop** — `interruptOn` config for approval workflows (AR agent)

Agents stream via `agent.stream()` with `streamMode: "updates"` → SSE → `useAgentStream` hook on the frontend.

## Project Structure

```
├── app/                    Next.js pages + API routes
├── agents/                 Deep agent definitions
│   ├── shared/             Model provider, checkpointer, event types
│   ├── ar-reconciliation/  AutoRecon agent + tools + prompts
│   ├── cashflow/           CashSight agent + 3 subagent prompts
│   ├── vendor-risk/        VendorGuard agent + tools
│   └── cfo-copilot/        BoardBrief agent + 2 subagents
├── skills/                 SKILL.md files for each domain
├── components/             React components (ui, layout, agent, dashboard, demo)
├── hooks/                  useAgentStream, useDashboardData, useAgentGraph
├── lib/                    DB clients, SSE streaming, utilities
├── types/                  TypeScript type definitions
├── prisma/                 Database schema
├── scripts/seed/           Data seeding scripts
└── data/faiss/             FAISS index files (gitignored)
```
