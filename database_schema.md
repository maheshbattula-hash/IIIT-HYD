# COLLECTIQ — Database Schema Specification
## Unified Relational Schema for Collections 360 & Analytics

---

### 1. Schema Overview

The database is structured to support both analytical aggregations and low-latency operational lookups. It utilizes an embedded relational database (SQLite via `node:sqlite`) with foreign key constraints, indexes on common search and filter columns (`customer_id`, `dpd`, `collection_bucket`, `ptp_status`), and comprehensive audit/lineage tracking.

---

### 2. Entity Relationship Diagram (ERD)

```
 +--------------------+       1:N       +----------------------+
 |     customers      | <-------------> |    card_accounts     |
 | (Golden Record)    |                 +----------------------+
 |                    |       1:N       +----------------------+
 | customer_id (PK)   | <-------------> |    loan_accounts     |
 | name, phone, email |                 +----------------------+
 | segment, risk_score|       1:N       +----------------------+
 | consent_status     | <-------------> |   deposit_accounts   |
 +--------------------+                 +----------------------+
           |
           | 1:1
           v
 +--------------------+       1:N       +----------------------+
 | collections_cases  | <-------------> |   contact_history    |
 | case_id (PK)       |                 +----------------------+
 | total_outstanding  |       1:N       +----------------------+
 | dpd, bucket (B0-B4)| <-------------> |     agent_notes      |
 | ptp_status, amount |                 +----------------------+
 | broken_ptp_count   |       1:N       +----------------------+
 +--------------------+ <-------------> |   call_transcripts   |
           |                            +----------------------+
           | 1:N
           v
 +--------------------+                 +----------------------+
 | nba_recommendations|                 |      audit_logs      |
 | rec_id (PK)        |                 | log_id (PK)          |
 | recommended_action |                 | timestamp, user, role|
 | confidence, factors|                 | action_type, query   |
 | review_status      |                 | details, decision    |
 +--------------------+                 +----------------------+
```

---

### 3. Detailed Table Definitions

#### 3.1 `customers` (Golden Master Record)
Stores resolved, deduplicated customer master records with lineage and quality metadata.
```sql
CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY,               -- e.g. 'CUST-10245'
    name TEXT NOT NULL,                         -- Cleaned full name
    primary_phone TEXT NOT NULL,                -- E.164 formatted phone (+91...)
    secondary_phone TEXT,                       -- Alternative phone
    email TEXT,                                 -- Cleaned lowercase email
    pan_number TEXT,                            -- Indian PAN or Tax Identifier
    customer_segment TEXT NOT NULL,             -- 'Salaried Prime', 'Self-Employed', 'SME', 'Affluent'
    address TEXT,                               -- Standardized residential address
    city TEXT,                                  -- City
    state TEXT,                                 -- State
    consent_status TEXT NOT NULL,               -- 'CONSENT_GRANTED', 'RESTRICTED_OPT_OUT'
    preferred_channel TEXT DEFAULT 'PHONE',     -- 'PHONE', 'WHATSAPP', 'SMS', 'EMAIL'
    best_time_to_contact TEXT,                  -- '10:00-12:00', '14:00-16:00', '18:00-20:00'
    credit_bureau_score INTEGER,                -- 300 to 900
    employment_status TEXT,                     -- 'Employed', 'Business Owner', 'Unemployed', 'Gig Worker'
    hardship_flag BOOLEAN DEFAULT 0,            -- 1 if flagged for vulnerability
    hardship_reason TEXT,                       -- Hardship description if flagged
    -- Lineage & Data Quality
    source_system TEXT DEFAULT 'CRM_MASTER',    -- Source system name
    data_quality_score REAL DEFAULT 1.0,        -- Quality index (0.0 to 1.0)
    match_confidence REAL DEFAULT 1.0,          -- Confidence in deduplication (0.0 to 1.0)
    last_refreshed_at TEXT NOT NULL             -- ISO-8601 timestamp
);
```

#### 3.2 `card_accounts` (Credit Card Relationships)
```sql
CREATE TABLE card_accounts (
    card_account_id TEXT PRIMARY KEY,           -- e.g. 'CARD-88301'
    customer_id TEXT NOT NULL,                  -- FK to customers.customer_id
    card_type TEXT NOT NULL,                    -- 'Platinum Rewards', 'Titanium Cashback', 'Corporate'
    card_number_masked TEXT NOT NULL,           -- e.g. 'XXXX-XXXX-XXXX-4921'
    credit_limit REAL NOT NULL,                 -- Maximum limit in INR
    current_balance REAL NOT NULL,              -- Current utilized balance
    minimum_amount_due REAL NOT NULL,           -- Current monthly overdue
    payment_due_date TEXT NOT NULL,             -- Due date (YYYY-MM-DD)
    apr REAL NOT NULL,                          -- Annual Percentage Rate
    status TEXT NOT NULL,                       -- 'ACTIVE', 'BLOCKED', 'DELINQUENT', 'CLOSED'
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.3 `loan_accounts` (Loans & Mortgages)
```sql
CREATE TABLE loan_accounts (
    loan_account_id TEXT PRIMARY KEY,           -- e.g. 'LOAN-40291'
    customer_id TEXT NOT NULL,                  -- FK to customers.customer_id
    loan_type TEXT NOT NULL,                    -- 'Personal Loan', 'Auto Loan', 'Home Loan', 'Business Loan'
    is_secured BOOLEAN NOT NULL DEFAULT 0,      -- 1 for secured, 0 for unsecured
    original_principal REAL NOT NULL,
    outstanding_principal REAL NOT NULL,
    emi_amount REAL NOT NULL,
    tenure_months INTEGER NOT NULL,
    remaining_emis INTEGER NOT NULL,
    overdue_amount REAL NOT NULL,
    dpd INTEGER NOT NULL DEFAULT 0,
    interest_rate REAL NOT NULL,
    status TEXT NOT NULL,                       -- 'ACTIVE', 'DELINQUENT', 'DEFAULTED', 'PAID_OFF'
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.4 `deposit_accounts` (Customer Liquidity & Accounts)
```sql
CREATE TABLE deposit_accounts (
    deposit_account_id TEXT PRIMARY KEY,        -- e.g. 'DEP-10928'
    customer_id TEXT NOT NULL,                  -- FK to customers.customer_id
    account_type TEXT NOT NULL,                 -- 'Savings Account', 'Current Account', 'Fixed Deposit'
    account_number_masked TEXT NOT NULL,        -- 'XXXX-XXXX-1932'
    current_balance REAL NOT NULL,
    avg_quarterly_balance REAL NOT NULL,
    is_salary_account BOOLEAN DEFAULT 0,
    status TEXT NOT NULL,                       -- 'ACTIVE', 'DORMANT', 'FROZEN'
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.5 `collections_cases` (Operational Delinquency Hub)
```sql
CREATE TABLE collections_cases (
    case_id TEXT PRIMARY KEY,                   -- e.g. 'CASE-5501'
    customer_id TEXT NOT NULL UNIQUE,           -- 1:1 with customer for active collections
    case_status TEXT NOT NULL,                  -- 'OPEN', 'PTP_ACTIVE', 'LEGAL_REVIEW', 'SETTLED', 'CLOSED'
    total_outstanding REAL NOT NULL,            -- Total debt exposure across products
    days_past_due INTEGER NOT NULL,             -- Maximum DPD
    collection_bucket TEXT NOT NULL,            -- 'B0 (Current)', 'B1 (1-30)', 'B2 (31-60)', 'B3 (61-90)', 'B4 (90+)'
    risk_tier TEXT NOT NULL,                    -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    assigned_agent_id TEXT,                     -- 'AGENT-104'
    assigned_strategy TEXT NOT NULL,            -- 'DIGITAL_NUDGE', 'TELE_CALLING', 'FIELD_VISIT', 'SPECIALIST_SETTLEMENT'
    ptp_status TEXT NOT NULL,                   -- 'NO_PTP', 'PROMISED', 'BROKEN', 'HONORED'
    ptp_date TEXT,                              -- Upcoming or last promise date
    ptp_amount REAL,                            -- Amount promised
    broken_ptp_count INTEGER DEFAULT 0,
    total_ptp_count INTEGER DEFAULT 0,
    ptp_reliability_score REAL DEFAULT 0.5,     -- Calculated score (0.0 to 1.0)
    last_contact_date TEXT,
    last_contact_channel TEXT,
    last_contact_outcome TEXT,                  -- 'CONNECTED_PROMISED', 'CONNECTED_REFUSED', 'NO_ANSWER', 'BUSY'
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.6 `contact_history` (Omnichannel Outreach History)
```sql
CREATE TABLE contact_history (
    interaction_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    channel TEXT NOT NULL,                      -- 'PHONE', 'SMS', 'WHATSAPP', 'EMAIL', 'IVR'
    direction TEXT NOT NULL,                    -- 'OUTBOUND', 'INBOUND'
    timestamp TEXT NOT NULL,
    agent_id TEXT,
    outcome TEXT NOT NULL,                      -- 'CONNECTED_PROMISED', 'NO_ANSWER', 'PROMISE_BROKEN', 'DISPUTE_RAISED'
    call_duration_seconds INTEGER DEFAULT 0,
    response_payload TEXT,                      -- Detailed summary or delivery receipt
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.7 `agent_notes` (Field & Call Center Notes)
```sql
CREATE TABLE agent_notes (
    note_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    note_category TEXT NOT NULL,                -- 'PAYMENT_ARRANGEMENT', 'HARDSHIP_DISPUTE', 'WRONG_NUMBER', 'GENERAL'
    note_text TEXT NOT NULL,
    sentiment TEXT,                             -- 'POSITIVE', 'NEUTRAL', 'HOSTILE', 'DISTRESSED'
    extracted_tags TEXT,                        -- JSON string of tags e.g. ["salary_delayed", "promised_friday"]
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.8 `call_transcripts` (Audio Interaction Intelligence)
```sql
CREATE TABLE call_transcripts (
    transcript_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    call_date TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    raw_transcript TEXT NOT NULL,               -- Full conversational text
    ai_summary TEXT,                            -- Extracted AI summary
    customer_intent TEXT,                       -- 'WILLING_TO_PAY', 'HARDSHIP', 'DISPUTING_FEES', 'EVASIVE'
    ptp_extracted_date TEXT,
    ptp_extracted_amount REAL,
    objections_raised TEXT,                     -- JSON list of objections
    hardship_indicators TEXT,                   -- JSON list of hardship signals
    follow_up_action TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.9 `nba_recommendations` (Next-Best-Action Decision Records)
```sql
CREATE TABLE nba_recommendations (
    recommendation_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    recommended_action TEXT NOT NULL,           -- 'SCHEDULE_PHONE_CALL', 'SEND_PAYMENT_LINK_SMS', 'OFFER_RESTRUCTURE_PLAN', etc.
    why_rationale TEXT NOT NULL,                -- Bulleted rationale
    supporting_factors TEXT NOT NULL,           -- JSON array of factors
    data_points_used TEXT NOT NULL,             -- JSON array of data sources referenced
    confidence_score REAL NOT NULL,             -- 0.0 to 1.0
    model_version TEXT NOT NULL,
    is_hardship_escalation BOOLEAN DEFAULT 0,
    review_status TEXT DEFAULT 'PENDING',       -- 'PENDING', 'APPROVED', 'MODIFIED', 'REJECTED'
    reviewer_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);
```

#### 3.10 `audit_logs` (Compliance & Traceability Ledger)
```sql
CREATE TABLE audit_logs (
    log_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_role TEXT NOT NULL,                    -- 'ADMIN', 'COLLECTIONS_MANAGER', 'COLLECTIONS_AGENT', 'ANALYST'
    action_type TEXT NOT NULL,                  -- 'NL_QUERY', 'VIEW_CUSTOMER', 'NBA_APPROVE', 'NBA_MODIFY', 'NBA_REJECT', 'DATA_QUALITY_RUN'
    entity_type TEXT,                           -- 'CUSTOMER', 'CASE', 'NBA', 'SYSTEM'
    entity_id TEXT,
    query_text TEXT,                            -- Question asked or SQL generated
    response_summary TEXT,
    decision TEXT,                              -- 'APPROVED', 'REJECTED', 'EXECUTED'
    client_ip TEXT DEFAULT '127.0.0.1'
);
```

#### 3.11 `raw_staging_customers` (Bronze Messy Data for Data Product Factory Demonstration)
Used to demonstrate the raw ingestion with duplicate records, non-standard names, conflicting phone numbers, and calculate deduplication & data quality metrics.
```sql
CREATE TABLE raw_staging_customers (
    raw_id TEXT PRIMARY KEY,
    source_feed TEXT NOT NULL,                  -- 'CORE_BANKING_CSV', 'CREDIT_CARD_API', 'CRM_EXPORT'
    extracted_name TEXT,
    extracted_phone TEXT,
    extracted_email TEXT,
    extracted_dob TEXT,
    national_id TEXT,
    raw_payload TEXT,
    ingestion_timestamp TEXT NOT NULL
);
```
