-- ============================================================
-- COLLECTIQ — Relational Database Schema (SQLite)
-- Golden Collections 360, Messy Raw Staging, Telemetry & Audit
-- ============================================================

-- 1. Raw Staging Customers (Messy source data for Data Product Factory & Deduplication demo)
CREATE TABLE IF NOT EXISTS raw_staging_customers (
    raw_id TEXT PRIMARY KEY,
    source_feed TEXT NOT NULL,
    extracted_name TEXT,
    extracted_phone TEXT,
    extracted_email TEXT,
    extracted_pan TEXT,
    extracted_address TEXT,
    extracted_dob TEXT,
    raw_payload TEXT,
    resolved_customer_id TEXT,
    match_confidence REAL,
    match_reason TEXT,
    ingestion_timestamp TEXT NOT NULL
);

-- 2. Golden Master Customers (Resolved, deduplicated, verified)
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    pan_number TEXT,
    customer_segment TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    consent_status TEXT NOT NULL DEFAULT 'CONSENT_GRANTED',
    preferred_channel TEXT DEFAULT 'PHONE',
    best_time_to_contact TEXT DEFAULT '10:00-12:00',
    credit_bureau_score INTEGER,
    employment_status TEXT,
    hardship_flag INTEGER DEFAULT 0,
    hardship_reason TEXT,
    source_system TEXT DEFAULT 'CRM_MASTER',
    data_quality_score REAL DEFAULT 0.98,
    match_confidence REAL DEFAULT 0.99,
    last_refreshed_at TEXT NOT NULL
);

-- 3. Credit Card Accounts
CREATE TABLE IF NOT EXISTS card_accounts (
    card_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    card_type TEXT NOT NULL,
    card_number_masked TEXT NOT NULL,
    credit_limit REAL NOT NULL,
    current_balance REAL NOT NULL,
    minimum_amount_due REAL NOT NULL,
    payment_due_date TEXT NOT NULL,
    apr REAL NOT NULL,
    status TEXT NOT NULL,
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 4. Loan Accounts
CREATE TABLE IF NOT EXISTS loan_accounts (
    loan_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    loan_type TEXT NOT NULL,
    is_secured INTEGER NOT NULL DEFAULT 0,
    original_principal REAL NOT NULL,
    outstanding_principal REAL NOT NULL,
    emi_amount REAL NOT NULL,
    tenure_months INTEGER NOT NULL,
    remaining_emis INTEGER NOT NULL,
    overdue_amount REAL NOT NULL,
    dpd INTEGER NOT NULL DEFAULT 0,
    interest_rate REAL NOT NULL,
    status TEXT NOT NULL,
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 5. Deposit Accounts
CREATE TABLE IF NOT EXISTS deposit_accounts (
    deposit_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_number_masked TEXT NOT NULL,
    current_balance REAL NOT NULL,
    avg_quarterly_balance REAL NOT NULL,
    is_salary_account INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 6. Collections Cases
CREATE TABLE IF NOT EXISTS collections_cases (
    case_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL UNIQUE,
    case_status TEXT NOT NULL,
    total_outstanding REAL NOT NULL,
    days_past_due INTEGER NOT NULL,
    collection_bucket TEXT NOT NULL,
    risk_tier TEXT NOT NULL,
    assigned_agent_id TEXT,
    assigned_strategy TEXT NOT NULL,
    ptp_status TEXT NOT NULL,
    ptp_date TEXT,
    ptp_amount REAL,
    broken_ptp_count INTEGER DEFAULT 0,
    total_ptp_count INTEGER DEFAULT 0,
    ptp_reliability_score REAL DEFAULT 0.5,
    last_contact_date TEXT,
    last_contact_channel TEXT,
    last_contact_outcome TEXT,
    data_quality_status TEXT DEFAULT 'VALID',
    last_refreshed_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 7. Contact History
CREATE TABLE IF NOT EXISTS contact_history (
    interaction_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    direction TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    agent_id TEXT,
    outcome TEXT NOT NULL,
    call_duration_seconds INTEGER DEFAULT 0,
    response_payload TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 8. Agent Notes
CREATE TABLE IF NOT EXISTS agent_notes (
    note_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    note_category TEXT NOT NULL,
    note_text TEXT NOT NULL,
    sentiment TEXT,
    extracted_tags TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 9. Call Transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
    transcript_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    call_date TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    raw_transcript TEXT NOT NULL,
    ai_summary TEXT,
    customer_intent TEXT,
    ptp_extracted_date TEXT,
    ptp_extracted_amount REAL,
    objections_raised TEXT,
    hardship_indicators TEXT,
    follow_up_action TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 10. Next Best Action Recommendations
CREATE TABLE IF NOT EXISTS nba_recommendations (
    recommendation_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    why_rationale TEXT NOT NULL,
    supporting_factors TEXT NOT NULL,
    data_points_used TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v2.4-collectiq-nba',
    is_hardship_escalation INTEGER DEFAULT 0,
    review_status TEXT DEFAULT 'PENDING',
    reviewer_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- 11. Audit Logs (Compliance & Lineage Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    query_text TEXT,
    response_summary TEXT,
    decision TEXT,
    client_ip TEXT DEFAULT '127.0.0.1'
);

-- Indexes for low-latency queries & search
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(primary_phone);
CREATE INDEX IF NOT EXISTS idx_customers_pan ON customers(pan_number);
CREATE INDEX IF NOT EXISTS idx_cases_bucket ON collections_cases(collection_bucket);
CREATE INDEX IF NOT EXISTS idx_cases_dpd ON collections_cases(days_past_due);
CREATE INDEX IF NOT EXISTS idx_cases_ptp ON collections_cases(ptp_status);
CREATE INDEX IF NOT EXISTS idx_notes_customer ON agent_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_customer ON contact_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
