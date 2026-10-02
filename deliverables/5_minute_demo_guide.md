# COLLECTIQ — 5-Minute Hackathon Demo Script & Judge Walkthrough
> **Presenter's Playbook: How to pitch CollectIQ with maximum impact in 300 seconds**

---

### Timing Breakdown

| Timestamp | Phase / Screen | Key Talking Points & Actions |
| :---: | :--- | :--- |
| **0:00 - 0:45** | **Executive Dashboard** (`/`) | The Collections Crisis: Fragmented data across core banking, cards, and telephony. Show KPI cards (INR total exposure, 87% PTP honored rate) and the Delinquency Buckets (B0-B4) chart. Point out the Roll-Rate Transition Matrix. |
| **0:45 - 1:45** | **AI Assistant Studio** (`/assistant`) | Not a generic chatbot: It is a controlled Collections Intelligence copilot. Click preset: *"Which customers are most likely to break a promise to pay?"*. Show the generated answer, click **`[View SQL]`** to show real SQLite read-only AST safety, click **`[View Customers]`** to see records. Test guardrail: *"What is the weather?"* -> Shows safety boundary with zero hallucination. |
| **1:45 - 2:45** | **Collections 360** (`/collections-360`) | Open customer **Rahul Kumar (CUST-10245)**. Show unified cards, loans, and salary account. Point out the **Lineage Badge** (*"CRM_MASTER (Golden Merge from 3 Sources)"*). Inspect the **Next Best Action** card (*"Schedule phone contact"*, 89% confidence). Click **`[Approve]`** under Human Review. |
| **2:45 - 3:30** | **Agent Assist Copilot** (`/agent-assist`) | Show how collection agents use the copilot. Click **`Generate Agent Briefing`**. Instant dossier generated: Situation, Recent interaction, Conversation focus, and Objection handling tips. Click **`[Copy briefing]`**. |
| **3:30 - 4:15** | **AI Agent & Post-Call** (`/agent` & `/post-call`) | (1) Run autonomous AI Agent task: watch the live pipeline stepper progress to the mandatory *"Human review required"* gate. (2) Open Post-Call Summary: click *"Load Vikram Patel (Hardship)"* -> show how AI detects medical emergency, changes intent to `HARDSHIP`, and enables vulnerability protection. |
| **4:15 - 5:00** | **Data Quality & Governance** (`/data-quality` & `/governance`) | Show Data Quality dimensions (97.4% score). Show Duplicate Clusters explorer: how 3 messy raw feeds merged into Rahul Kumar with 98.5% confidence. Switch role in header to **`Risk Analyst`** and show how customer PII is automatically masked in real time! Show the immutable Audit Ledger recording our decisions. |

---

### Verbatim Pitch Script

#### 1. Hook & Problem (0:00 - 0:45)
*"Good morning judges. Every year, banks write off billions in bad debt—not because customers refuse to pay, but because collections operations are fragmented. Loan data sits in one legacy system, credit cards in another, call center transcripts are buried in telephony logs, and field agent notes are scattered across spreadsheets.*

*This is **CollectIQ**—an AI-powered collections intelligence platform that unifies enterprise data into a trusted Collections 360, provides controlled natural-language querying, and drives explainable, human-in-the-loop recoveries."*

#### 2. AI Assistant & Guardrails (0:45 - 1:45)
*"CollectIQ is not an unconstrained chatbot. It is a governed domain assistant. Notice our studio interface. When a collections manager asks: 'Which customers are most likely to break a promise to pay?'—watch what happens.*

*CollectIQ translates the intent into a parameterized, read-only SQL query against our SQLite database. Clicking **[View SQL]**, you see the exact query generated. Clicking **[View Customers]**, you see the live debtor records. If I attempt an injection or ask an out-of-domain question like 'What is the weather in Delhi?', our guardrail intercepts it immediately: 'I can't answer this because the requested information is outside available Collections data.' No hallucinations, 100% compliance."*

#### 3. Collections 360 & Next Best Action (1:45 - 2:45)
*"Now let's examine our Golden Customer View for Rahul Kumar (CUST-10245). Rahul has an overdue personal loan and a delinquent credit card, but also maintains an active salary account with us. Notice our **Lineage Badge**—it proves this golden profile was merged from 3 disparate raw feeds with 98.5% confidence.*

*Here is our **Next Best Action** engine. It recommends: 'Schedule phone contact' with 89% confidence because Rahul's salary was delayed and his promise date is approaching on Friday. Notice our core philosophy: **Human-in-the-loop**. An agent must click **[Approve]**, **[Modify]**, or **[Reject]**. When I click Approve, it is permanently logged into our compliance audit ledger."*

#### 4. Agent Assist & Post-Call Intelligence (2:45 - 3:30)
*"For collection agents on the phone, cognitive overload is huge. In our **Agent Assist** workspace, one click on **'Generate Agent Briefing'** creates a personalized conversation guide with objection handling tips that the agent can copy in one second.*

*After the call, our **Post-Call Summary** studio ingests the transcript, automatically extracts customer intent, promised amounts, and detects hardship. For customer Vikram Patel, who cited an emergency hospitalization, our ethical AI guardrail triggers immediately: it pauses aggressive recovery and initiates loan restructuring review."*

#### 5. Data Quality & RBAC (3:30 - 5:00)
*"Finally, under the hood: our **Data Quality Center** continuously enforces our formal Data Contract across completeness, uniqueness, and freshness. In our **Duplicate Clusters** explorer, you see exact proof of our entity resolution.*

*And in our **Governance** center, we enforce strict Role-Based Access Control. When I toggle our user role to **Risk Analyst**, watch the customer roster: phone numbers, emails, and PAN IDs are dynamically masked for privacy! Every single action, query, and decision is cryptographically recorded in our immutable audit trail.*

*CollectIQ is runnable locally with zero setup, 32 passing automated tests, and enterprise-grade architecture. Thank you, and we welcome your questions!"*
