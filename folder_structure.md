# COLLECTIQ — Folder & Project Structure
## Organization of Codebase & Deliverables

```
d:/Users/Mahesh/IIIT-H/
├── package.json                 # Monorepo root scripts (dev, build, seed, test)
├── tsconfig.json                # Shared TypeScript base configuration
├── .env.example                 # Config template (AI_PROVIDER, PORT, API keys)
├── architecture.md              # 3-Layer Architecture specifications
├── database_schema.md           # Database tables, ERD, and column constraints
├── implementation_plan.md       # 10-Phase implementation roadmap
├── folder_structure.md          # This directory manifest
│
├── server/                      # Express + Node.js Backend API
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             # Express server entry point & route registration
│       ├── config.ts            # Environment variables & runtime settings
│       ├── db/
│       │   ├── database.ts      # Zero-dependency node:sqlite connection manager
│       │   ├── schema.sql       # Table definitions DDL
│       │   ├── seed.ts          # Messy raw generation -> Deduplication -> Golden 360
│       │   └── data_contract.json # Data Contract definition
│       ├── ai/
│       │   ├── aiProvider.ts    # AI Provider abstraction (Mock, Gemini, OpenAI)
│       │   ├── nlToSqlEngine.ts # Controlled NL-to-SQL parser & AST validator
│       │   ├── ragEngine.ts     # Unstructured retrieval for notes, transcripts, docs
│       │   ├── nbaEngine.ts     # Explainable Next Best Action engine
│       │   ├── agentOrchestrator.ts # Multi-step AI Agent workflow engine
│       │   └── transcriptAnalyzer.ts # Call transcript intent & PTP extraction
│       ├── routes/
│       │   ├── customers.ts     # /api/customers & Collections 360 endpoints
│       │   ├── collections.ts   # /api/collections cases & treatments
│       │   ├── analytics.ts     # /api/analytics KPI metrics & roll rates
│       │   ├── dataQuality.ts   # /api/data-quality scores & duplicate clusters
│       │   ├── ai.ts            # /api/ai/query, /api/ai/agent, /api/ai/nba, etc.
│       │   ├── audit.ts         # /api/audit-logs compliance logging
│       │   └── search.ts        # /api/search global multi-entity search
│       └── middleware/
│           ├── auth.ts          # RBAC simulation & header role verification
│           └── auditMiddleware.ts # Automatic API action auditing
│
├── client/                      # React 18 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx             # Application bootstrap
│       ├── App.tsx              # Router & layout composition
│       ├── index.css            # Design tokens, financial SaaS styling
│       ├── types/               # TypeScript interfaces
│       ├── api/                 # API client methods with offline mock fallback
│       ├── context/
│       │   ├── AuthContext.tsx  # Active Role (Admin, Manager, Agent, Analyst)
│       │   └── AssistantContext.tsx # Floating drawer / dockable AI chat state
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx  # CollectIQ primary navigation
│       │   │   ├── Header.tsx   # Global search, notifications, role switcher
│       │   │   └── FloatingAssistant.tsx # Quick dockable assistant widget
│       │   ├── common/
│       │   │   ├── LineageBadge.tsx # Source & freshness metadata badge
│       │   │   ├── QualityBadge.tsx # Data quality confidence badge
│       │   │   ├── StatCard.tsx     # Executive metric card
│       │   │   └── Modal.tsx        # Accessible dialog wrapper
│       │   ├── assistant/
│       │   │   ├── ChatComposer.tsx # Input, Plus attachment menu, mic button
│       │   │   ├── MessageBubble.tsx # Answer, SQL viewer, customer cards, sources
│       │   │   └── DemoQuestions.tsx # 1-click hackathon judge queries
│       │   ├── agent/
│       │   │   ├── AgentStepper.tsx # Visual task execution pipeline
│       │   │   └── HumanReviewModal.tsx # HITL Approve/Modify/Reject
│       │   ├── nba/
│       │   │   └── NBAReviewCard.tsx # Explainable recommendation & review
│       │   ├── customer360/
│       │   │   ├── ProfileHeader.tsx
│       │   │   ├── FinancialAccounts.tsx
│       │   │   ├── CollectionsTelemetry.tsx
│       │   │   ├── InteractionTimeline.tsx
│       │   │   └── RiskIndicators.tsx
│       │   └── postCall/
│       │       └── TranscriptStudio.tsx # Side-by-side call & structured notes
│       └── pages/
│           ├── DashboardPage.tsx     # Executive analytics & delinquency buckets
│           ├── CustomersPage.tsx     # Searchable customer roster
│           ├── Collections360Page.tsx # Detailed customer 360 view
│           ├── AssistantPage.tsx     # Full-page AI Assistant Studio
│           ├── AgentPage.tsx         # Autonomous AI Agent Studio
│           ├── AgentAssistPage.tsx   # Agent Copilot with Briefing generator
│           ├── PostCallPage.tsx      # Post-Call transcript intelligence
│           ├── AnalyticsPage.tsx     # Deep analytics & roll-rate matrix
│           ├── DataQualityPage.tsx   # Quality scores, deduplication, contract
│           ├── GovernancePage.tsx    # RBAC matrix, audit log explorer
│           └── SettingsPage.tsx      # AI provider switch, API keys, dark mode
│
├── tests/                       # Automated Verification Suite
│   ├── deduplication.test.ts    # Customer ID matching & duplicate clustering
│   ├── dataQuality.test.ts      # Schema validation & quality scores
│   ├── nlToSql.test.ts          # Read-only validation & injection blocking
│   ├── nbaEngine.test.ts        # Next-best-action rules & hardship flags
│   └── rbac.test.ts             # Role-based data masking & permission tests
│
└── deliverables/                # Hackathon Presentation Artifacts
    ├── 5_minute_demo_guide.md   # Scripted walkthrough for hackathon judges
    ├── pitch_deck_outline.md    # 10-slide competitive deck
    ├── data_contract.md         # Data contract documentation
    └── data_quality_report.md   # Data quality audit report
```
