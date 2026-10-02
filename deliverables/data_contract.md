# COLLECTIQ — Formal Data Product Contract
## Collections 360 Golden Customer Master Specification

---

### 1. Contract Overview
- **Data Product**: `Collections360GoldenCustomerDataProduct`
- **Version**: `2.4.0`
- **Owner**: Enterprise Collections Risk Operations & Data Platform Engineering
- **Contact**: `data-governance@collectiq.internal`
- **Specification Standard**: Open Data Contract Standard (ODCS) / JSON-Schema 2020-12
- **Effective Date**: `2026-10-02`

---

### 2. Service Level Agreement (SLA) & Freshness
- **Freshness Window**: Hourly batch updates with Change-Data-Capture (CDC) streaming for contact events.
- **Maximum Tolerable Latency**: 15 minutes for payment status and PTP status transitions.
- **Availability Target**: 99.9% uptime during operational calling windows (08:00 to 20:00 IST).
- **Audit Retention**: 7 years of immutable historical change-logs for regulatory compliance.

---

### 3. Permitted & Prohibited Operational Uses

#### 3.1 Permitted Operational Uses
1. **Omnichannel Contact Optimization**: Determining optimal communication channels (WhatsApp vs SMS vs Telephony) and time-of-day contact windows.
2. **Next Best Action (NBA) Decisioning**: Algorithmic generation of collection treatments with mandatory human review.
3. **Portfolio Roll-Rate Monitoring**: Analyzing delinquency bucket transition probabilities (B0 through B4).
4. **Agent Briefing Generation**: Real-time dossier synthesis to reduce agent cognitive load during debtor negotiations.
5. **Post-Call Debriefing & Compliance**: Automatic transcription analysis for promise-to-pay commitments and hardship indicators.

#### 3.2 Prohibited Operational Uses
1. **Adverse Decisions on Protected Attributes**: Algorithmic decisioning based on gender, race, religion, sexual orientation, or caste is strictly forbidden.
2. **Automated Legal Escalation**: Autonomous generation of legal notices or field dispatch without documented human manager approval.
3. **Unauthenticated PII Exposure**: Exposing unmasked customer phone numbers, emails, or government tax identifiers (PAN) outside authenticated collections roles.

---

### 4. Quality Rules & Automated Constraints

| Dimension | Constraint Rule | Threshold | Violation Action |
| :--- | :--- | :---: | :--- |
| **Completeness** | `customer_id`, `name`, `primary_phone`, `customer_segment`, `total_outstanding`, `days_past_due` must not be null. | $\ge 95\%$ | Reject batch to dead-letter quarantine |
| **Uniqueness** | Zero unresolved duplicate identities in Golden Master dataset. | $\ge 99\%$ | Flag for manual survivorship review |
| **Validity** | Primary phone must match regex `^\+?[0-9]{10,14}$`. Credit bureau score must be between 300 and 900. | $\ge 98\%$ | Trigger cleansing pipeline alert |
| **Consistency** | `collections_cases.total_outstanding` = $\sum$ `card_accounts.current_balance` + $\sum$ `loan_accounts.outstanding_principal`. | $\ge 97\%$ | Escalate reconciliation mismatch |
| **Freshness** | Records must have `last_refreshed_at` timestamp within 24 hours. | $\ge 99\%$ | Raise ingestion lag incident |

---

### 5. Schema Definition & DDL

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Collections360Customer",
  "type": "object",
  "required": [
    "customer_id",
    "name",
    "primary_phone",
    "customer_segment",
    "total_outstanding",
    "days_past_due",
    "collection_bucket"
  ],
  "properties": {
    "customer_id": {
      "type": "string",
      "pattern": "^CUST-[0-9]{5}$",
      "description": "Unique deterministic customer identifier"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "description": "Resolved full legal name"
    },
    "primary_phone": {
      "type": "string",
      "pattern": "^\\+?[0-9]{10,14}$",
      "description": "E.164 formatted verified primary mobile number"
    },
    "customer_segment": {
      "type": "string",
      "enum": ["Salaried Prime", "Self-Employed", "SME", "Affluent", "Gig Worker"],
      "description": "Risk segmentation category"
    },
    "total_outstanding": {
      "type": "number",
      "minimum": 0,
      "description": "Total aggregated debt across all accounts in INR"
    },
    "days_past_due": {
      "type": "integer",
      "minimum": 0,
      "description": "Maximum delinquency in days across all credit products"
    },
    "collection_bucket": {
      "type": "string",
      "enum": ["B0 (Current)", "B1 (1-30)", "B2 (31-60)", "B3 (61-90)", "B4 (90+)"],
      "description": "Delinquency aging bucket"
    },
    "hardship_flag": {
      "type": "integer",
      "enum": [0, 1],
      "description": "1 if flagged for vulnerability or acute financial hardship"
    }
  }
}
```
