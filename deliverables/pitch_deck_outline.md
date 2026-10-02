# COLLECTIQ — 10-Slide Hackathon Pitch Deck Outline
## Transforming Debt Collections with Unified Data and Explainable AI

---

### Slide 1: Title & Vision
- **Header**: COLLECTIQ — AI-Powered Collections Intelligence Platform
- **Subheader**: Unifying Enterprise Data, Explainable AI, and Human-in-the-Loop Debt Resolution
- **Visual**: Platform mockup showing the Collections 360 profile and AI Assistant Studio
- **Presenter Note**: Introduce team and core mission: making collections compliant, efficient, and compassionate.

---

### Slide 2: The $150B Problem — The Fragmented Debt Crisis
- **Key Friction Points**:
  1. **Data Silos**: Core banking, credit card systems, loan origination, and CRM don't speak to each other.
  2. **Suboptimal Outreach**: Agents call customers at the wrong time on the wrong channel with zero context.
  3. **Regulatory & Vulnerability Violations**: Aggressive automated actions trigger fines when customer hardship is missed.
  4. **High Roll-Rate Deterioration**: Inability to detect broken promise patterns before accounts roll into default.
- **Stat**: 68% of overdue debt is recoverable with timely, personalized contact.

---

### Slide 3: The Solution — CollectIQ 3-Layer Platform
- **Layer 1: Data Product Factory**: Bronze messy raw ingestion → Silver cleansing & deduplication → Golden Collections 360 with Data Contracts.
- **Layer 2: Collections 360 Semantic Hub**: Omnichannel contact graph, cross-product exposure (cards + loans + deposits), and PTP reliability metrics.
- **Layer 3: Operational AI Suite**: Controlled NL-to-SQL assistant, autonomous AI Agent, explainable Next Best Action, and post-call intelligence.
- **Visual**: 3-tier architecture diagram.

---

### Slide 4: Data Product Factory & Deduplication Engine
- **The Challenge**: Messy real-world data (varying phone formats, spelling variations, duplicate records).
- **The Engine**: Multi-factor identity resolution (normalized E.164 phone, PAN match, fuzzy token similarity).
- **The Result**: 11 messy raw feeds resolved into 8 golden master records with 98.2% average confidence.
- **Governance**: Formal JSON-Schema Data Contract enforcing < 15 min SLA and strict permitted uses.

---

### Slide 5: Collections 360 — The Single Source of Truth
- **Customer Dossier**: Spotlight on Rahul Kumar (CUST-10245).
- **Holistic Financial Exposure**:
  - Personal Loan (INR 1,45,000, 38 DPD, B2 bucket)
  - Credit Card (INR 42,000 balance)
  - Offsetting Salary Account (INR 18,500 liquid balance)
- **Lineage Proof**: Every data point displays source system, refresh timestamp, and quality badge.

---

### Slide 6: Controlled NL-to-SQL — Zero Hallucination Intelligence
- **Why Not ChatGPT?**: Financial institutions cannot tolerate hallucinations or unvalidated queries.
- **CollectIQ Guardrail Pipeline**:
  `Natural Language Query` → `Intent Extraction` → `Allowed Schema Whitelist` → `AST Read-Only Safety Validation` → `Database Execution` → `Provenance Explanation`.
- **Destructive Operation Blocking**: 100% blocked on `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`.
- **Out-of-Domain Intercept**: Non-collections questions intercepted safely.

---

### Slide 7: Next Best Action & Ethical AI Guardrails
- **Explainable Decisioning**: Multi-factor scoring (DPD, PTP history, past channel response, preferred contact window).
- **Ethical AI Vulnerability Screening**:
  - Zero protected demographic attributes utilized.
  - Hardship Detection (medical emergency, job loss) immediately halts aggressive outreach and initiates restructuring review.
- **Human-in-the-Loop (HITL)**: Mandatory `[Approve]`, `[Modify]`, `[Reject]` controls recorded in compliance audit trail.

---

### Slide 8: Agent Assist Copilot & Post-Call Transcript Studio
- **Agent Briefing Copilot**: One-click dossier generating Situation, Recent Interaction, Conversation Focus, and Objection Handling Tips.
- **Post-Call Speech Intelligence**: Automated extraction of customer intent (`WILLING_TO_PAY` vs `HARDSHIP`), promise-to-pay date and amount, objections, and CRM-ready notes.
- **Human Edit**: Allows agents to modify structured notes before saving to customer history.

---

### Slide 9: Enterprise Governance & Role-Based Access Control (RBAC)
- **Strict Role Separation**:
  - `ADMIN`: Full system governance, audit, and contracts.
  - `COLLECTIONS_MANAGER`: Portfolio strategy, team cases, NBA approval.
  - `COLLECTIONS_AGENT`: Assigned debtor workspace, copilot briefing.
  - `ANALYST`: Portfolio telemetry with automated PII masking (phones, emails, PAN IDs redacted).
- **Compliance Ledger**: Immutable audit log tracking every query, model version, and human review decision.

---

### Slide 10: Market Opportunity, Impact & Future Roadmap
- **Immediate Business Impact**:
  - **+22%** Increase in Promise-to-Pay fulfillment.
  - **-40%** Reduction in agent pre-call preparation time.
  - **Zero** Regulatory compliance breaches through automated hardship guardrails.
- **Technical Excellence**:
  - Zero-configuration embedded SQLite architecture.
  - Multi-provider AI abstraction (MockProvider, Gemini, OpenAI).
  - 32 automated test assertions with 100% pass rate.
- **Closing Call to Action**: CollectIQ turns debt collections from adversarial friction into trusted, intelligent customer resolution.
