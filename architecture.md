# COLLECTIQ — Enterprise Architecture Document
## AI-Powered Collections Intelligence Platform

---

### 1. Executive Summary
**CollectIQ** is an enterprise-grade Collections Intelligence Platform designed to transform fragmented debt collections operations into a unified, explainable, and compliant intelligence workflow. Instead of acting as an unconstrained generative chatbot, CollectIQ serves as a specialized domain intelligence system that bridges enterprise core systems (Cards, Loans, Deposits, CRM, Telephony) with a governed 3-Layer Data Product Factory, a controlled Natural Language-to-SQL engine, an unstructured RAG retriever, and an explainable Human-in-the-Loop Next-Best-Action (NBA) decision engine.

---

### 2. High-Level 3-Layer Architectural Blueprint

```
+----------------------------------------------------------------------------------------------------+
|                                    COLLECTIQ SYSTEM ARCHITECTURE                                   |
+----------------------------------------------------------------------------------------------------+

 [ RAW ENTERPRISE SOURCES ]
  + Core Banking (Deposits, Current Accts)
  + Card Management System (Credit Cards, Overdrafts)
  + Loan Origination & Servicing (Auto, Personal, Mortgages)
  + Collections Management System (Cases, Delinquency Buckets)
  + Telephony / Contact Center (Recordings, Call Transcripts)
  + CRM & Field Ops (Agent Notes, Customer Interactions)
  + External Bureau / Demographic Feeds (Credit Scores, Employment)
                                   |
                                   v
+====================================================================================================+
| LAYER 1: DATA PRODUCT FACTORY (Bronze -> Silver -> Gold)                                           |
+====================================================================================================+
| 1. RAW INGESTION (Bronze):                                                                         |
|    - Ingestion contracts, raw staging with ingestion timestamp & source hash                      |
|    - Messy synthetic data injection (duplicates, phone variants, missing values, date skews)      |
|                                                                                                    |
| 2. DATA HYGIENE & CLEANSING (Silver):                                                              |
|    - Validation rules (Regex phone normalization, ISO-8601 date parsing, range checks)            |
|    - Data Quality Engine: Completeness, Uniqueness, Validity, Consistency, Freshness metrics      |
|                                                                                                    |
| 3. IDENTITY RESOLUTION & DEDUPLICATION:                                                            |
|    - Multi-factor deterministic & fuzzy matching (Tax ID / PAN, Phone, Email + Levenshtein Name)   |
|    - Confidence Scoring (0 - 100%) & Survivorship rules for golden records                         |
|                                                                                                    |
| 4. GOLDEN COLLECTIONS 360 STORE (Gold):                                                            |
|    - Relational SQLite schema (ACID compliant, zero-config embedded Node.js engine)                |
|    - Lineage tracking metadata (Source system, Last Refreshed, Quality Status, Field Confidence)   |
|    - Data Contracts (JSON Schema, SLAs, permitted purposes, owner metadata)                       |
+====================================================================================================+
                                   |
                                   v
+====================================================================================================+
| LAYER 2: UNIFIED COLLECTIONS 360 SEMANTIC & FEATURE LAYER                                          |
+====================================================================================================+
| + Customer Demographics & Omnichannel Contact Graph (Phone, WhatsApp, Email, Best Time to Call)   |
| + Multi-product Financial Exposure (Cards, Loans, Deposits aggregate exposure & net position)     |
| + Collections Lifecycle Telemetry (DPD, Bucket B0-B4, PTP History, Broken Promises, Contact Rate)  |
| + Interaction Intelligence (Agent Notes Vector/Keyword Index, Call Transcripts & Sentiment)       |
| + Risk & Vulnerability Signals (PTP Reliability, Early Warning Signs, Hardship Indicators)        |
+====================================================================================================+
                                   |
                                   v
+====================================================================================================+
| LAYER 3: INTELLIGENCE, DECISIONING & OPERATIONAL AGENTS                                            |
+====================================================================================================+
|                                                                                                    |
|  [ CONTROLLED NL-TO-SQL ]          [ UNSTRUCTURED RAG ENGINE ]         [ NEXT BEST ACTION (NBA) ]  |
|  * Intent & Entity Extraction      * Semantic / Keyword Search         * Multi-factor scoring      |
|  * Schema Whitelisting & Guardrails* Call Transcripts & Agent Notes     * Ethical guardrails        |
|  * Read-Only AST Validation        * Grounded Citations & Sources      * Vulnerability detection   |
|  * Query Execution & Synthesis     * Contextual Summarization          * Confidence scoring        |
|                                                                                                    |
|                         [ MULTI-STEP AI AGENT ORCHESTRATOR ]                                       |
|  Task -> Understanding -> Data Retrieval -> SQL Query -> Analysis -> Recommendation -> Review     |
|                                                                                                    |
|                         [ HUMAN-IN-THE-LOOP (HITL) WORKFLOW ]                                      |
|  Every consequential action requires: [Approve] | [Modify] | [Reject] -> Audit Logged             |
+====================================================================================================+
                                   |
                                   v
+====================================================================================================+
| PRESENTATION LAYER: ENTERPRISE FINANCIAL SAAS APPLICATION                                         |
+====================================================================================================+
| + Executive Collections Dashboard (KPIs, Roll-Rate Matrix, Delinquency Buckets, Quality Health)   |
| + Collections 360 Customer Portal (Unified profile, Lineage Badges, Financial Relationships)       |
| + AI Assistant Studio (Controlled NL-to-SQL, Source Inspector, SQL Viewer, Context Attachments)    |
| + Autonomous AI Agent Studio (Live Stepper execution, Task presets, Guardrail badges)             |
| + Agent Assist Copilot (One-click Briefing generator, Objection handling, Call script)            |
| + Post-Call Transcript Analyzer (Intent classification, PTP extraction, Hardship flagging)        |
| + Data Quality Center & Contract Inspector (Duplicate clusters, Freshness, Validation matrix)     |
| + Governance & Audit Trail (RBAC role switcher: Admin, Manager, Agent, Analyst; Immutable Logs)   |
+====================================================================================================+
```

---

### 3. Key Architectural Principles

1. **Deterministic Guardrails Over Hallucination**:
   - The Natural Language to SQL pipeline restricts operations strictly to validated `SELECT` statements against a schema whitelist.
   - Any query containing prohibited tokens (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `EXEC`) is halted immediately at the AST/validation layer.
   - Out-of-domain questions are intercepted with clear boundaries: *"I can't answer this because the requested information is outside the available Collections data."*

2. **Ethical AI & Vulnerability First**:
   - Protected demographic attributes (gender, age, race, religion) are strictly prohibited from entering algorithmic decisioning logic.
   - Customers showing financial hardship or emotional vulnerability (medical emergencies, job loss, bereavement) are flagged for compassionate human review rather than subjected to automated aggressive collection actions.

3. **Human-in-the-Loop (HITL) by Default**:
   - High-impact operational actions (initiating legal proceedings, restructuring debt, field agent dispatch, reporting to credit bureau) cannot execute automatically.
   - Every recommendation presents explicit evidence, supporting factors, confidence metrics, and requires human agent approval, modification, or rejection.

4. **Zero-Configuration Local Developer Experience**:
   - Employs Node.js native embedded SQLite (`node:sqlite`), requiring zero database server setup, Docker containers, or C++ compiler toolchains.
   - Provides a multi-provider AI abstraction (`MockProvider`, `GeminiProvider`, `OpenAIProvider`) enabling instantaneous full functionality even without external API keys.

---

### 4. Role-Based Access Control (RBAC) Matrix

| Feature / Domain | ADMIN | COLLECTIONS_MANAGER | COLLECTIONS_AGENT | ANALYST |
| :--- | :---: | :---: | :---: | :---: |
| **Executive Dashboard & Roll-rates** | Full | Full | Read-Only | Full |
| **Collections 360 Customer View** | Full | Full | Full | Read-Only (Masked PII) |
| **Next Best Action - Human Review** | Full | Approve / Modify | Execute Assigned | Read-Only |
| **AI Assistant (NL-to-SQL)** | Full | Full | Full | Full |
| **Agent Assist Briefing Generator** | Full | Full | Full | View Only |
| **Post-Call Summary Analyzer** | Full | Full | Edit & Submit | View Only |
| **Data Quality Center & Contracts** | Full | Full | View Only | Full |
| **Governance & System Audit Logs** | Full | View Team Logs | View Self Logs | View Audit Metrics |
| **Raw SQL Execution Sandbox** | Full | Read Only | Disabled | Read Only |
