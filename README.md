# COLLECTIQ — AI-Powered Collections Intelligence Platform
> **Enterprise Financial Services Intelligence & Decisioning Suite**

CollectIQ is a student hackathon collections intelligence platform built to solve fragmented debt collections operations across cards, loans, deposits, telephony, CRM, and field agent notes. It delivers a governed **3-Layer Data Product Factory**, an explainable **Collections 360** profile, a controlled **Natural Language-to-SQL + RAG** engine, and a **Human-in-the-Loop Next Best Action (NBA)** decisioning system.

---

## 🌟 Key Features

1. **Layer 1: Data Product Factory**
   - **Realistic Messy Raw Feeds**: Ingests messy source data with intentional duplicates, differing phone formats (`09876543210`, `+91 98765-43210`), typos, and conflicting IDs.
   - **Deterministic & Fuzzy Deduplication Engine**: Merges raw records into Golden Master customer records with calculated **Match Confidence Scores** (e.g. 98.5%).
   - **Formal Data Contract**: Enforces JSON Schema, SLA freshness (< 1 hour), and explicit permitted vs prohibited uses.

2. **Layer 2: Collections 360 Unified Profile**
   - **Multi-Product Exposure**: Real-time cross-product view of Credit Cards, Personal/Auto Loans, and Salary/Savings deposits.
   - **Delinquency Telemetry**: Days Past Due (DPD), Collection Buckets (B0 to B4), Promise-to-Pay (PTP) commitments, broken promise tracking, and PTP reliability scoring.
   - **Field-Level Data Lineage**: Every data point displays provenance badges (`CRM_MASTER`, `CORE_BANKING`, `GOLDEN_MERGE`), last refresh timestamp, and quality status.

3. **Layer 3: Operational AI Suite**
   - **Controlled NL-to-SQL Assistant**: User questions are translated into safe read-only SQL queries against an allowed schema whitelist. Destructive operations (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`) are strictly blocked at the AST level.
   - **Out-of-Domain Guardrail**: Safely intercepts non-collections questions (*"I can't answer this because the requested information is outside the available Collections data."*) with zero hallucinations.
   - **Contextual Chat Composer**: Includes `+` context attachment menu (Upload document, CSV, Customer record, Call transcript, Agent note), attachment chips, and voice input microphone.
   - **Interactive Action Buttons**: Every answer provides `[View SQL]`, `[View Sources]`, `[Explain]`, `[View Customers]`, and `[Ask Follow-up]`.
   - **Autonomous AI Agent Mode**: Multi-step pipeline execution (`Task` → `Understanding` → `Finding data` → `Running query` → `Analyzing result` → `Generating recommendation` → `Human review`).
   - **Explainable Next Best Action (NBA)**: Multi-factor scoring with bulleted reasons, supporting evidence, confidence score, and mandatory human review controls (`[Approve]`, `[Modify]`, `[Reject]`).
   - **Ethical AI Hardship Guardrail**: Protects vulnerable debtors (e.g. acute medical emergency) by pausing aggressive collections and recommending restructuring/forbearance. Excludes protected demographic attributes from algorithms.
   - **Agent Assist Copilot**: One-click **"Generate Agent Briefing"** producing call situation, recent interactions, conversation focus, objection handling tips, and `[Copy briefing]`.
   - **Post-Call Transcript Intelligence**: Side-by-side analysis of debtor calls extracting customer intent, PTP date, promised amount, objections, hardship flags, and structured CRM notes with human edit capability.
   - **Role-Based Access Control (RBAC)**: Interactive switcher for `ADMIN`, `COLLECTIONS_MANAGER`, `COLLECTIONS_AGENT`, and `ANALYST` (with dynamic PII masking for Analyst).
   - **Immutable Audit Trail**: Cryptographically traceable ledger recording all AI queries, generated queries, recommendations, and human approvals.

---

## 🚀 Quick Start Guide (Beginner Friendly — Zero Config)

CollectIQ is engineered with zero external database dependencies. It uses Node.js native embedded SQLite (`node:sqlite`) and an internal domain intelligence provider (`MockProvider`), allowing you to clone and run the application instantly without Docker or paid API keys.

### Prerequisites
- **Node.js** (v20+ or v22+ or v26+)
- **npm** (v9+)

### 1. Installation
Clone the repository and install all dependencies:
```bash
# In the root repository
npm install

# Install server packages
npm install --prefix server

# Install client packages
npm install --prefix client
```

### 2. Seed the Database
Generate the synthetic messy raw feeds, run the deduplication engine, and populate the Golden Collections 360 database:
```bash
npm run seed
```
*Output will confirm 11 raw messy records resolved into 8 Golden Master profiles with 98.2% average confidence.*

### 3. Run Automated Tests
Verify all 32 automated tests (matching, schema validation, SQL injection blocking, guardrails, NBA, and RBAC):
```bash
npm run test
```

### 4. Start Local Development Server
Start the Express backend (`http://127.0.0.1:5080`) and React Vite frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

Open your browser to **`http://localhost:3000`** to experience CollectIQ!

---

## 🏆 5-Minute Hackathon Demo Journey

Follow this structured journey to demonstrate CollectIQ to hackathon judges:

1. **Executive Dashboard (`/`)**:
   - Show high-level KPIs: Total Customers (8), Active Cases (8), Exposure, PTP Rate (87%).
   - Highlight the **Exposure by Bucket (B0-B4)** bar chart and **Roll-Rate Migration Matrix**.

2. **AI Assistant (`/assistant`)**:
   - Click the preset demo question: *"Which customers are most likely to break a promise to pay?"*
   - Show the generated natural language answer.
   - Click **`[View SQL]`** to show the validated read-only SQL query.
   - Click **`[View Customers]`** to show the matched debtors.
   - Test out-of-domain guardrail by asking *"What is the weather in Delhi?"* to prove zero hallucination!

3. **Collections 360 (`/collections-360`)**:
   - Inspect **Rahul Kumar (CUST-10245)**: 38 DPD, personal loan and credit card debt, active PTP commitment.
   - Show the **Lineage Badge**: *"CRM_MASTER (Golden Merge from 3 Sources)"*.
   - Review the **Next Best Action** card: *"Schedule phone contact"* (89% confidence).
   - Click **`[Approve]`** under Human Review. Show the approval toast.

4. **Agent Assist Copilot (`/agent-assist`)**:
   - Click **`Generate Agent Briefing`**. Show how the AI generates Situation, Context, Focus, and Objection Handling tips in 1 second. Click **`[Copy briefing]`**.

5. **AI Agent Studio (`/agent`)**:
   - Select task *"Analyze Customer Delinquency & Profile"* and click **`Execute Agent Task`**.
   - Watch the animated execution stepper progress:
     `Task` → `Understanding` → `Finding data` → `Running query` → `Analyzing result` → `Generating recommendation` → `Human review required`.
   - Click **`Approve & Execute`**.

6. **Post-Call Summary (`/post-call`)**:
   - Click **`Analyze Transcript`** on Rahul Kumar's call. Show extracted intent (`WILLING_TO_PAY`), PTP Date (`2026-10-09`), and amount (`INR 22,900`).
   - Switch to **Vikram Patel (Hardship)** and analyze. Show how intent changes to `HARDSHIP` and the `Vulnerability Detected` badge lights up!

7. **Data Quality Center (`/data-quality`)**:
   - Show the 5 Quality Dimensions (Completeness, Uniqueness, Validity, Consistency, Freshness).
   - Click **`Identity Resolution & Duplicate Clusters`** tab to show how 3 messy raw feeds (`RAW-001`, `RAW-002`, `RAW-003`) were merged into `Rahul Kumar` with 98.5% confidence!
   - Click **`Data Product Contract Specification`** tab to view the live JSON schema and SLAs.

8. **Governance & RBAC (`/governance`)**:
   - View the Immutable Audit Ledger and show that our previous SQL query and NBA approvals are permanently recorded!
   - In the top header role dropdown, switch from **`Collections Manager`** to **`Risk Analyst`**.
   - Navigate to **`Customers`** page and show that phone numbers, emails, and PAN IDs are now masked for privacy!

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite |
| **Backend** | Node.js, Express, TypeScript, tsx, CORS |
| **Database** | Embedded SQLite via Node.js native `node:sqlite` (`DatabaseSync`) |
| **AI Layer** | Multi-Provider Abstraction (`MockProvider`, `GeminiProvider`, `OpenAIProvider`) |
| **Testing** | Native automated assertions suite (`npm run test`) |

---

## 📁 Repository Structure

```
d:/Users/Mahesh/IIIT-H/
├── architecture.md              # 3-Layer Architecture specifications
├── database_schema.md           # Database tables, ERD, and constraints
├── implementation_plan.md       # 10-Phase roadmap & verification
├── folder_structure.md          # Directory manifest
├── README.md                    # This document
│
├── server/                      # Express + TypeScript Backend
│   ├── src/
│   │   ├── index.ts             # Express server entry point (port 5080)
│   │   ├── config.ts            # Environment settings
│   │   ├── db/
│   │   │   ├── database.ts      # Native SQLite DatabaseSync connection manager
│   │   │   ├── schema.sql       # DDL table creation
│   │   │   ├── seed.ts          # Messy raw generator & deduplication engine
│   │   │   └── data_contract.json # Data Contract specification
│   │   ├── ai/
│   │   │   ├── aiProvider.ts    # AI abstraction (MockProvider & GeminiProvider)
│   │   │   ├── nlToSqlEngine.ts # Controlled NL-to-SQL engine & AST validator
│   │   │   ├── ragEngine.ts     # Unstructured text retriever over notes/calls
│   │   │   ├── nbaEngine.ts     # Explainable Next Best Action engine
│   │   │   └── transcriptAnalyzer.ts # Call transcript parser
│   │   ├── routes/              # Modular API endpoints
│   │   └── middleware/auth.ts   # RBAC & PII masking middleware
│   └── tests/runAllTests.ts     # 32 automated test assertions
│
├── client/                      # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI widgets, layout, assistant, NBA
│   │   ├── pages/               # Dashboard, 360, Assistant, Agent, Quality, Gov
│   │   ├── context/             # AuthContext (RBAC) & AssistantContext (Copilot)
│   │   └── api/index.ts         # Typed API client
│
└── deliverables/                # Hackathon presentation artifacts
    ├── 5_minute_demo_guide.md   # Scripted walkthrough for judges
    ├── pitch_deck_outline.md    # 10-slide deck
    ├── data_contract.md         # Formal data contract documentation
    └── data_quality_report.md   # Audited data quality report
```

---

## 🔒 Security, Compliance & Ethical AI

- **Read-Only SQL AST Validator**: Blocks any query containing `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `PRAGMA`, or `EXEC`.
- **Dynamic PII Masking**: Automatically redacts sensitive phone numbers, emails, and PAN IDs for restricted roles.
- **Ethical AI Vulnerability Screening**: Prohibits decisions using protected demographic attributes (gender, race, age, religion). Flags hardship for human compassion.
- **Human-in-the-Loop Gate**: Consequential recovery actions cannot execute without human agent or manager review.
- **Immutable Audit Trail**: Every AI generation, parameter, and review decision is logged with timestamps and user IDs.
