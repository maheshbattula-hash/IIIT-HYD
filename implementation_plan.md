# COLLECTIQ — Implementation Plan & Phase Roadmap

---

### Implementation Strategy

CollectIQ will be built methodically across 10 defined phases. Each phase concludes with automated verification, local execution check, and UI validation to guarantee a reliable, production-grade deliverable for the hackathon judges.

---

### Phase Breakdown

#### Phase 1: Project Setup, Design System & Navigation
- **Goal**: Initialize root package, client (React + Vite + TypeScript + Tailwind CSS + Lucide Icons + Recharts), server (Express + TypeScript + node:sqlite).
- **Deliverables**:
  - Root monorepo configuration with unified npm scripts (`npm run dev`, `npm run build`, `npm run test`).
  - Sleek, enterprise financial dashboard design tokens (slate/indigo/emerald palette, accessible contrast, typography).
  - Primary Sidebar navigation (Dashboard, Collections 360, Customers, AI Assistant, AI Agent, Analytics, Data Quality, Governance, Settings).
  - Header with Global Search bar, active user profile, and RBAC Role Switcher (`ADMIN`, `COLLECTIONS_MANAGER`, `COLLECTIONS_AGENT`, `ANALYST`).
  - Dockable Floating Assistant component present across all pages.
- **Verification**: Run frontend and backend concurrently, verify routing and responsive navigation.

#### Phase 2: Synthetic Datasets, Database & Collections 360
- **Goal**: Build the Layer 1 Data Product Factory and Layer 2 Collections 360 view.
- **Deliverables**:
  - SQLite database initialization (`node:sqlite`) with schema DDL.
  - Realistic messy raw generator: duplicate records (e.g., "Rahul Kumar" vs "Rahul K"), varied phone formats (`+91 98765-43210`, `09876543210`), missing emails, differing date formats.
  - Identity Resolution & Deduplication engine with confidence scores and survivorship rules.
  - Golden Collections 360 database populated with rich, representative customer records (e.g. Rahul Kumar `CUST-10245`, Priya Sharma `CUST-10482`, Vikram Patel `CUST-10733`, etc.).
  - Detailed Collections 360 UI: Demographic card, Cards/Loans/Deposits portfolio, Collections telemetry (DPD, Bucket, PTP history), Interaction timeline, Risk indicators, and Lineage/Quality metadata on every data point.
- **Verification**: Query database via API, inspect deduplicated clusters, verify Collections 360 rendering.

#### Phase 3: Executive Dashboard, Analytics & Data Quality Center
- **Goal**: Build executive overview and data observability suite.
- **Deliverables**:
  - KPI Stat Cards: Total Customers, Active Collections Cases, Total Outstanding, PTP Rate, Broken Promise Rate, Contact Success Rate, Hardship Cases.
  - Interactive Visualizations: Delinquency Buckets (B0-B4), Promise-to-Pay timeline trends, Channel effectiveness, Roll-rate transition matrix.
  - Data Quality Center: Completeness, Uniqueness, Validity, Consistency, Freshness gauges.
  - Duplicate Records Explorer: Visual before-and-after view of raw messy records merged into golden profiles with match confidence.
  - Data Contract Viewer: Live inspection of schema, SLAs, and permitted uses.
- **Verification**: Verify chart interactivity, metric accuracy, and data quality calculation.

#### Phase 4: Controlled NL-to-SQL & AI Assistant Studio
- **Goal**: Build the Natural Language to SQL pipeline and enterprise chat studio.
- **Deliverables**:
  - Safe NL-to-SQL Engine with intent classification and schema whitelisting.
  - AST / Token validator enforcing strict READ-ONLY `SELECT` statements (blocking `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`).
  - Multi-provider AI abstraction (`MockProvider`, `GeminiProvider`, `OpenAIProvider`).
  - Chat interface with `+` attachment menu (Upload doc, CSV, Customer record, Call transcript, Agent note) and attachment chips.
  - Microphone button for speech input.
  - Rich response bubbles: Answer, Data Used, Filters Understood, SQL Query Viewer (`[View SQL]`), Sources Drawer (`[View Sources]`), Explanation (`[Explain]`), Customer Cards (`[View Customers]`), and Follow-up suggestions.
  - Strict out-of-domain guardrail: *"I can't answer this because the requested information is outside the available Collections data."*
- **Verification**: Test sample hackathon questions, verify SQL generation, verify non-SELECT queries are blocked.

#### Phase 5: RAG Over Unstructured Notes & Transcripts
- **Goal**: Enable hybrid querying across structured collections records and unstructured agent notes/call logs.
- **Deliverables**:
  - Retrieval engine with token scoring and keyword indexing over `agent_notes` and `call_transcripts`.
  - Context augmentation passing relevant snippets to AI provider.
  - Citation tags displaying exact timestamp, agent, and source excerpt.
- **Verification**: Ask unstructured queries (e.g., "Summarize customer notes for CUST-10245"), verify retrieved sources.

#### Phase 6: Next Best Action (NBA) Engine & Agent Assist Workspace
- **Goal**: Operationalize explainable decisioning and agent copilot.
- **Deliverables**:
  - Explainable NBA engine generating actions (`Schedule phone contact`, `Send payment link SMS`, `Offer restructure plan`, `Assign specialist`, `Monitor`).
  - Factor scoring: DPD, PTP reliability, past channel success, hardship flags.
  - Ethical AI guardrail: Excludes protected attributes; flags hardship for human compassion.
  - Human-in-the-Loop review modal: `[Approve]`, `[Modify]`, `[Reject]` with reason capture.
  - Agent Assist Workspace: Customer dossier, one-click "Generate Agent Briefing" with objection handling tips and `[Copy briefing]` button.
- **Verification**: Review an NBA recommendation, perform Approve/Modify/Reject, inspect audit persistence.

#### Phase 7: Post-Call Summary Analyzer
- **Goal**: Automate post-call debriefing and structured data extraction.
- **Deliverables**:
  - Call transcript library (Willing to pay, Hardship dispute, Evasive, Partial settlement).
  - AI extraction of Call Summary, Customer Intent, PTP Date, PTP Amount, Objections, Hardship indicators, and Follow-up tasks.
  - Side-by-side interactive editor allowing agents to modify before saving to customer history.
- **Verification**: Run post-call analysis on multiple transcripts, verify structured extraction.

#### Phase 8: Governance, Role-Based Access & Audit Logging
- **Goal**: Enterprise security, auditability, and regulatory compliance.
- **Deliverables**:
  - Real-time RBAC switcher in header (`ADMIN`, `COLLECTIONS_MANAGER`, `COLLECTIONS_AGENT`, `ANALYST`).
  - Dynamic data masking (e.g. masking PAN, phone numbers, and balances for restricted roles).
  - Comprehensive Audit Log table recording every AI query, generated SQL, NBA decision, and administrative action.
  - Audit search and filter by user, role, date, and action type.
- **Verification**: Switch roles in UI, verify UI permissions change and PII masks appropriately.

#### Phase 9: Automated Testing & Demo Mode
- **Goal**: Ensure rock-solid reliability for judges without manual setup.
- **Deliverables**:
  - Automated tests: deduplication, schema quality, read-only SQL validation, injection blocking, NBA scoring, RBAC masking.
  - 1-click Demo Mode with preset questions and spotlight on key customer `Rahul Kumar (CUST-10245)`.
- **Verification**: Run test suite via `npm test` and verify 100% pass rate.

#### Phase 10: Final Polish & Hackathon Deliverables
- **Goal**: Polish UX, ensure zero console errors, compile presentation materials.
- **Deliverables**:
  - Architecture diagram and system documentation.
  - `5_minute_demo_guide.md` (exact script for hackathon pitch).
  - `pitch_deck_outline.md` (10-slide deck).
  - `README.md` with beginner-friendly local startup instructions.
  - Browser verification of complete judge workflow.
- **Verification**: Perform full end-to-end browser walkthrough.
