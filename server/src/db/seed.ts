import { db, initializeDatabase, execute } from './database.js';

// Identity resolution helper: Normalize phone to E.164 (+91XXXXXXXXXX)
export function normalizePhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return digits ? `+${digits}` : '';
}

// Simple Levenshtein distance for fuzzy name matching
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // Check prefix or abbreviation (e.g. "Rahul Kumar" vs "Rahul K.")
  const s1Words = s1.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const s2Words = s2.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  if (s1Words[0] === s2Words[0]) {
    if (s1Words.length > 1 && s2Words.length > 1) {
      if (s1Words[1][0] === s2Words[1][0]) {
        return 0.90; // Matching first name and matching last name initial
      }
    }
    return 0.85;
  }

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Number((1 - distance / maxLen).toFixed(2));
}

export function seedDatabase() {
  console.log('[CollectIQ Data Factory] Initializing schema...');
  initializeDatabase();

  console.log('[CollectIQ Data Factory] Purging existing tables...');
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM nba_recommendations;
    DELETE FROM call_transcripts;
    DELETE FROM agent_notes;
    DELETE FROM contact_history;
    DELETE FROM collections_cases;
    DELETE FROM deposit_accounts;
    DELETE FROM loan_accounts;
    DELETE FROM card_accounts;
    DELETE FROM customers;
    DELETE FROM raw_staging_customers;
  `);

  console.log('[CollectIQ Data Factory] Ingesting messy raw staging data (Layer 1 - Bronze)...');

  // Realistic messy raw feeds with duplicates, varying phone formats, and typos
  const rawFeeds = [
    {
      raw_id: 'RAW-001',
      source_feed: 'CORE_BANKING_CSV',
      extracted_name: 'Rahul Kumar',
      extracted_phone: '09876543210',
      extracted_email: 'rahul.kumar@gmail.com',
      extracted_pan: 'ABCDE1234F',
      extracted_address: 'Flat 402, Green Glen Layout, Bellandur, Bangalore',
      extracted_dob: '1988-04-12',
      raw_payload: JSON.stringify({ core_id: 'CB-9941', status: 'ACTIVE' }),
      resolved_customer_id: 'CUST-10245',
      match_confidence: 0.99,
      match_reason: 'Primary Master Identity from Core Banking',
    },
    {
      raw_id: 'RAW-002',
      source_feed: 'CREDIT_CARD_API',
      extracted_name: 'Rahul K.',
      extracted_phone: '+91 98765-43210',
      extracted_email: 'rahul_k88@yahoo.com',
      extracted_pan: 'ABCDE1234F',
      extracted_address: 'Bellandur Bangalore Karnataka 560103',
      extracted_dob: '12/04/1988',
      raw_payload: JSON.stringify({ card_num: '4921', limit: 150000 }),
      resolved_customer_id: 'CUST-10245',
      match_confidence: 0.98,
      match_reason: 'Matched on PAN ABCDE1234F & normalized phone +919876543210',
    },
    {
      raw_id: 'RAW-003',
      source_feed: 'CRM_EXPORT',
      extracted_name: 'R Kumar',
      extracted_phone: '9876543210',
      extracted_email: null,
      extracted_pan: null,
      extracted_address: 'Bangalore, KA',
      extracted_dob: null,
      raw_payload: JSON.stringify({ crm_lead: 'LEAD-8841' }),
      resolved_customer_id: 'CUST-10245',
      match_confidence: 0.94,
      match_reason: 'Matched on normalized phone +919876543210 with high token similarity',
    },
    {
      raw_id: 'RAW-004',
      source_feed: 'CORE_BANKING_CSV',
      extracted_name: 'Priya Sharma',
      extracted_phone: '+919823456789',
      extracted_email: 'priya.sharma@outlook.com',
      extracted_pan: 'BKZPS8821M',
      extracted_address: 'Plot 18, Road No. 36, Jubilee Hills, Hyderabad',
      extracted_dob: '1992-09-21',
      raw_payload: JSON.stringify({ acct: 'SAV-902' }),
      resolved_customer_id: 'CUST-10482',
      match_confidence: 0.99,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-005',
      source_feed: 'LOAN_SERVICING_SYS',
      extracted_name: 'Priya S',
      extracted_phone: '09823456789',
      extracted_email: 'priya.sharma@outlook.com',
      extracted_pan: 'BKZPS8821M',
      extracted_address: 'Jubilee Hills, Hyderabad, Telangana',
      extracted_dob: '21-09-1992',
      raw_payload: JSON.stringify({ loan_ref: 'AL-3091' }),
      resolved_customer_id: 'CUST-10482',
      match_confidence: 0.98,
      match_reason: 'Matched on PAN BKZPS8821M & normalized phone +919823456789',
    },
    {
      raw_id: 'RAW-006',
      source_feed: 'CORE_BANKING_CSV',
      extracted_name: 'Vikram Patel',
      extracted_phone: '+919712345670',
      extracted_email: 'vikram.patel@pateltextiles.in',
      extracted_pan: 'CKMPV5519L',
      extracted_address: 'G-12, GIDC Phase 2, Vatva, Ahmedabad, Gujarat',
      extracted_dob: '1979-11-05',
      raw_payload: JSON.stringify({ biz_tier: 'MSME' }),
      resolved_customer_id: 'CUST-10733',
      match_confidence: 0.99,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-007',
      source_feed: 'CRM_EXPORT',
      extracted_name: 'Anita Desai',
      extracted_phone: '9845012345',
      extracted_email: 'anita.desai@infosys.com',
      extracted_pan: 'DLKPA4019Q',
      extracted_address: 'Tower 4, Prestige Shantiniketan, Whitefield, Bangalore',
      extracted_dob: '1995-02-18',
      raw_payload: JSON.stringify({ emp: 'Infosys' }),
      resolved_customer_id: 'CUST-10901',
      match_confidence: 0.99,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-008',
      source_feed: 'TELEPHONY_LOGS',
      extracted_name: 'Rajesh Verma',
      extracted_phone: '+91-9988776655',
      extracted_email: 'rajesh.v.rider@gmail.com',
      extracted_pan: 'EPQRV7712N',
      extracted_address: 'House 88, Sector 22, Noida, Uttar Pradesh',
      extracted_dob: '1990-07-14',
      raw_payload: JSON.stringify({ channel: 'INBOUND_IVR' }),
      resolved_customer_id: 'CUST-11204',
      match_confidence: 0.98,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-009',
      source_feed: 'CORE_BANKING_CSV',
      extracted_name: 'Amit Saxena',
      extracted_phone: '+919911223344',
      extracted_email: 'amit.saxena@delhi-exports.com',
      extracted_pan: 'FXPSA3344P',
      extracted_address: 'B-4, Kailash Colony, New Delhi',
      extracted_dob: '1984-06-30',
      raw_payload: JSON.stringify({ segment: 'Affluent' }),
      resolved_customer_id: 'CUST-11355',
      match_confidence: 0.99,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-010',
      source_feed: 'CRM_EXPORT',
      extracted_name: 'Sunita Rao',
      extracted_phone: '+919877112233',
      extracted_email: 'sunita.rao@chennai-health.org',
      extracted_pan: 'GYPSR5566T',
      extracted_address: '14, Anna Nagar West, Chennai, Tamil Nadu',
      extracted_dob: '1987-12-03',
      raw_payload: JSON.stringify({ doctor: true }),
      resolved_customer_id: 'CUST-11490',
      match_confidence: 0.99,
      match_reason: 'Master Record match',
    },
    {
      raw_id: 'RAW-011',
      source_feed: 'LOAN_SERVICING_SYS',
      extracted_name: 'Deepak Joshi',
      extracted_phone: '09811998877',
      extracted_email: 'deepak.joshi@pune-tech.com',
      extracted_pan: 'HZPDJ9900R',
      extracted_address: 'Flat 101, Rohan Mithila, Viman Nagar, Pune',
      extracted_dob: '1993-01-25',
      raw_payload: JSON.stringify({ emi_bounce: 1 }),
      resolved_customer_id: 'CUST-11621',
      match_confidence: 0.98,
      match_reason: 'Master Record match',
    }
  ];

  const now = new Date().toISOString();

  const insertRawStmt = db.prepare(`
    INSERT INTO raw_staging_customers (
      raw_id, source_feed, extracted_name, extracted_phone, extracted_email,
      extracted_pan, extracted_address, extracted_dob, raw_payload,
      resolved_customer_id, match_confidence, match_reason, ingestion_timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const raw of rawFeeds) {
    insertRawStmt.run(
      raw.raw_id, raw.source_feed, raw.extracted_name, raw.extracted_phone,
      raw.extracted_email, raw.extracted_pan, raw.extracted_address, raw.extracted_dob,
      raw.raw_payload, raw.resolved_customer_id, raw.match_confidence,
      raw.match_reason, now
    );
  }

  console.log('[CollectIQ Data Factory] Populating Golden Master Customers (Layer 2 - Gold)...');

  const customers = [
    {
      customer_id: 'CUST-10245',
      name: 'Rahul Kumar',
      primary_phone: '+919876543210',
      secondary_phone: '+918025591024',
      email: 'rahul.kumar@gmail.com',
      pan_number: 'ABCDE1234F',
      customer_segment: 'Salaried Prime',
      address: 'Flat 402, Green Glen Layout, Bellandur, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'PHONE',
      best_time_to_contact: '18:00-20:00',
      credit_bureau_score: 712,
      employment_status: 'Employed (Sr. Systems Engineer)',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CRM_MASTER (Golden Merge from 3 Sources)',
      data_quality_score: 0.98,
      match_confidence: 0.99,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-10482',
      name: 'Priya Sharma',
      primary_phone: '+919823456789',
      secondary_phone: null,
      email: 'priya.sharma@outlook.com',
      pan_number: 'BKZPS8821M',
      customer_segment: 'Self-Employed',
      address: 'Plot 18, Road No. 36, Jubilee Hills, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'WHATSAPP',
      best_time_to_contact: '14:00-16:00',
      credit_bureau_score: 640,
      employment_status: 'Interior Design Consultant',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CRM_MASTER (Golden Merge)',
      data_quality_score: 0.96,
      match_confidence: 0.985,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-10733',
      name: 'Vikram Patel',
      primary_phone: '+919712345670',
      secondary_phone: '+917926589900',
      email: 'vikram.patel@pateltextiles.in',
      pan_number: 'CKMPV5519L',
      customer_segment: 'Micro-SME',
      address: 'G-12, GIDC Phase 2, Vatva, Ahmedabad',
      city: 'Ahmedabad',
      state: 'Gujarat',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'PHONE',
      best_time_to_contact: '10:00-12:00',
      credit_bureau_score: 580,
      employment_status: 'Textile Unit Proprietor',
      hardship_flag: 1,
      hardship_reason: 'Acute Medical Hardship: Hospitalization of family member; operational cashflow crisis.',
      source_system: 'LOAN_SERVICING_MASTER',
      data_quality_score: 0.95,
      match_confidence: 0.99,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-10901',
      name: 'Anita Desai',
      primary_phone: '+919845012345',
      secondary_phone: null,
      email: 'anita.desai@infosys.com',
      pan_number: 'DLKPA4019Q',
      customer_segment: 'Salaried Prime',
      address: 'Tower 4, Prestige Shantiniketan, Whitefield, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'SMS',
      best_time_to_contact: '12:00-14:00',
      credit_bureau_score: 785,
      employment_status: 'Senior Product Manager',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CREDIT_CARD_MASTER',
      data_quality_score: 0.99,
      match_confidence: 0.995,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-11204',
      name: 'Rajesh Verma',
      primary_phone: '+919988776655',
      secondary_phone: null,
      email: 'rajesh.v.rider@gmail.com',
      pan_number: 'EPQRV7712N',
      customer_segment: 'Gig Worker',
      address: 'House 88, Sector 22, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'PHONE',
      best_time_to_contact: '14:00-16:00',
      credit_bureau_score: 610,
      employment_status: 'Logistics / Fleet Delivery Partner',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CORE_BANKING_MASTER',
      data_quality_score: 0.94,
      match_confidence: 0.97,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-11355',
      name: 'Amit Saxena',
      primary_phone: '+919911223344',
      secondary_phone: '+911145678901',
      email: 'amit.saxena@delhi-exports.com',
      pan_number: 'FXPSA3344P',
      customer_segment: 'Affluent',
      address: 'B-4, Kailash Colony, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'EMAIL',
      best_time_to_contact: '16:00-18:00',
      credit_bureau_score: 820,
      employment_status: 'Export House Director',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'WEALTH_MGMT_MASTER',
      data_quality_score: 0.99,
      match_confidence: 0.99,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-11490',
      name: 'Sunita Rao',
      primary_phone: '+919877112233',
      secondary_phone: null,
      email: 'sunita.rao@chennai-health.org',
      pan_number: 'GYPSR5566T',
      customer_segment: 'Salaried Prime',
      address: '14, Anna Nagar West, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'PHONE',
      best_time_to_contact: '10:00-12:00',
      credit_bureau_score: 695,
      employment_status: 'Senior Consultant Physician',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CRM_MASTER',
      data_quality_score: 0.97,
      match_confidence: 0.99,
      last_refreshed_at: now,
    },
    {
      customer_id: 'CUST-11621',
      name: 'Deepak Joshi',
      primary_phone: '+919811998877',
      secondary_phone: null,
      email: 'deepak.joshi@pune-tech.com',
      pan_number: 'HZPDJ9900R',
      customer_segment: 'Salaried Prime',
      address: 'Flat 101, Rohan Mithila, Viman Nagar, Pune',
      city: 'Pune',
      state: 'Maharashtra',
      consent_status: 'CONSENT_GRANTED',
      preferred_channel: 'WHATSAPP',
      best_time_to_contact: '18:00-20:00',
      credit_bureau_score: 660,
      employment_status: 'Software QA Engineer',
      hardship_flag: 0,
      hardship_reason: null,
      source_system: 'CORE_BANKING_MASTER',
      data_quality_score: 0.96,
      match_confidence: 0.98,
      last_refreshed_at: now,
    }
  ];

  const insertCustStmt = db.prepare(`
    INSERT INTO customers (
      customer_id, name, primary_phone, secondary_phone, email,
      pan_number, customer_segment, address, city, state,
      consent_status, preferred_channel, best_time_to_contact,
      credit_bureau_score, employment_status, hardship_flag,
      hardship_reason, source_system, data_quality_score,
      match_confidence, last_refreshed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of customers) {
    insertCustStmt.run(
      c.customer_id, c.name, c.primary_phone, c.secondary_phone, c.email,
      c.pan_number, c.customer_segment, c.address, c.city, c.state,
      c.consent_status, c.preferred_channel, c.best_time_to_contact,
      c.credit_bureau_score, c.employment_status, c.hardship_flag,
      c.hardship_reason, c.source_system, c.data_quality_score,
      c.match_confidence, c.last_refreshed_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Card Accounts...');
  const cardAccounts = [
    {
      card_account_id: 'CARD-88301',
      customer_id: 'CUST-10245',
      card_type: 'Titanium Rewards Card',
      card_number_masked: 'XXXX-XXXX-XXXX-4921',
      credit_limit: 150000,
      current_balance: 42000,
      minimum_amount_due: 6300,
      payment_due_date: '2026-10-15',
      apr: 36.0,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      card_account_id: 'CARD-99120',
      customer_id: 'CUST-10482',
      card_type: 'Business Cashback Card',
      card_number_masked: 'XXXX-XXXX-XXXX-8812',
      credit_limit: 200000,
      current_balance: 110000,
      minimum_amount_due: 22000,
      payment_due_date: '2026-09-20',
      apr: 38.5,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      card_account_id: 'CARD-55102',
      customer_id: 'CUST-10901',
      card_type: 'Infinite Sapphire Card',
      card_number_masked: 'XXXX-XXXX-XXXX-3319',
      credit_limit: 300000,
      current_balance: 65000,
      minimum_amount_due: 7200,
      payment_due_date: '2026-10-05',
      apr: 34.0,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      card_account_id: 'CARD-77341',
      customer_id: 'CUST-11355',
      card_type: 'Regalia Gold Card',
      card_number_masked: 'XXXX-XXXX-XXXX-7704',
      credit_limit: 500000,
      current_balance: 85000,
      minimum_amount_due: 8500,
      payment_due_date: '2026-10-28',
      apr: 32.0,
      status: 'ACTIVE',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    }
  ];

  const insertCardStmt = db.prepare(`
    INSERT INTO card_accounts (
      card_account_id, customer_id, card_type, card_number_masked,
      credit_limit, current_balance, minimum_amount_due,
      payment_due_date, apr, status, data_quality_status, last_refreshed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const card of cardAccounts) {
    insertCardStmt.run(
      card.card_account_id, card.customer_id, card.card_type, card.card_number_masked,
      card.credit_limit, card.current_balance, card.minimum_amount_due,
      card.payment_due_date, card.apr, card.status, card.data_quality_status, card.last_refreshed_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Loan Accounts...');
  const loanAccounts = [
    {
      loan_account_id: 'LOAN-40291',
      customer_id: 'CUST-10245',
      loan_type: 'Unsecured Personal Loan',
      is_secured: 0,
      original_principal: 300000,
      outstanding_principal: 145000,
      emi_amount: 11450,
      tenure_months: 36,
      remaining_emis: 14,
      overdue_amount: 22900,
      dpd: 38,
      interest_rate: 13.5,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      loan_account_id: 'LOAN-66319',
      customer_id: 'CUST-10482',
      loan_type: 'Auto Loan',
      is_secured: 1,
      original_principal: 800000,
      outstanding_principal: 200000,
      emi_amount: 18500,
      tenure_months: 60,
      remaining_emis: 12,
      overdue_amount: 45000,
      dpd: 72,
      interest_rate: 9.8,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      loan_account_id: 'LOAN-88902',
      customer_id: 'CUST-10733',
      loan_type: 'Unsecured Business Loan',
      is_secured: 0,
      original_principal: 1000000,
      outstanding_principal: 520000,
      emi_amount: 42000,
      tenure_months: 36,
      remaining_emis: 15,
      overdue_amount: 126000,
      dpd: 105,
      interest_rate: 16.5,
      status: 'DEFAULTED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      loan_account_id: 'LOAN-33128',
      customer_id: 'CUST-11204',
      loan_type: 'Two-Wheeler Loan',
      is_secured: 1,
      original_principal: 65000,
      outstanding_principal: 38000,
      emi_amount: 2950,
      tenure_months: 24,
      remaining_emis: 14,
      overdue_amount: 5900,
      dpd: 45,
      interest_rate: 14.0,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      loan_account_id: 'LOAN-99041',
      customer_id: 'CUST-11490',
      loan_type: 'Professional Practice Loan',
      is_secured: 0,
      original_principal: 500000,
      outstanding_principal: 180000,
      emi_amount: 16800,
      tenure_months: 36,
      remaining_emis: 12,
      overdue_amount: 16800,
      dpd: 28,
      interest_rate: 11.2,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      loan_account_id: 'LOAN-11029',
      customer_id: 'CUST-11621',
      loan_type: 'Personal Loan',
      is_secured: 0,
      original_principal: 250000,
      outstanding_principal: 92000,
      emi_amount: 9800,
      tenure_months: 36,
      remaining_emis: 10,
      overdue_amount: 19600,
      dpd: 52,
      interest_rate: 14.5,
      status: 'DELINQUENT',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    }
  ];

  const insertLoanStmt = db.prepare(`
    INSERT INTO loan_accounts (
      loan_account_id, customer_id, loan_type, is_secured,
      original_principal, outstanding_principal, emi_amount,
      tenure_months, remaining_emis, overdue_amount, dpd,
      interest_rate, status, data_quality_status, last_refreshed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const loan of loanAccounts) {
    insertLoanStmt.run(
      loan.loan_account_id, loan.customer_id, loan.loan_type, loan.is_secured,
      loan.original_principal, loan.outstanding_principal, loan.emi_amount,
      loan.tenure_months, loan.remaining_emis, loan.overdue_amount, loan.dpd,
      loan.interest_rate, loan.status, loan.data_quality_status, loan.last_refreshed_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Deposit Accounts...');
  const depositAccounts = [
    {
      deposit_account_id: 'DEP-10928',
      customer_id: 'CUST-10245',
      account_type: 'Salary Savings Account',
      account_number_masked: 'XXXX-XXXX-1932',
      current_balance: 18500,
      avg_quarterly_balance: 32000,
      is_salary_account: 1,
      status: 'ACTIVE',
      last_refreshed_at: now
    },
    {
      deposit_account_id: 'DEP-22019',
      customer_id: 'CUST-10482',
      account_type: 'Current Business Account',
      account_number_masked: 'XXXX-XXXX-4421',
      current_balance: 4200,
      avg_quarterly_balance: 12500,
      is_salary_account: 0,
      status: 'ACTIVE',
      last_refreshed_at: now
    },
    {
      deposit_account_id: 'DEP-33901',
      customer_id: 'CUST-10733',
      account_type: 'Current Account',
      account_number_masked: 'XXXX-XXXX-8901',
      current_balance: 1100,
      avg_quarterly_balance: 85000,
      is_salary_account: 0,
      status: 'ACTIVE',
      last_refreshed_at: now
    },
    {
      deposit_account_id: 'DEP-44120',
      customer_id: 'CUST-10901',
      account_type: 'Salary Savings Account',
      account_number_masked: 'XXXX-XXXX-6712',
      current_balance: 145000,
      avg_quarterly_balance: 180000,
      is_salary_account: 1,
      status: 'ACTIVE',
      last_refreshed_at: now
    },
    {
      deposit_account_id: 'DEP-55091',
      customer_id: 'CUST-11355',
      account_type: 'Privilege Current Account',
      account_number_masked: 'XXXX-XXXX-9902',
      current_balance: 890000,
      avg_quarterly_balance: 1200000,
      is_salary_account: 0,
      status: 'ACTIVE',
      last_refreshed_at: now
    }
  ];

  const insertDepStmt = db.prepare(`
    INSERT INTO deposit_accounts (
      deposit_account_id, customer_id, account_type, account_number_masked,
      current_balance, avg_quarterly_balance, is_salary_account,
      status, last_refreshed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const dep of depositAccounts) {
    insertDepStmt.run(
      dep.deposit_account_id, dep.customer_id, dep.account_type, dep.account_number_masked,
      dep.current_balance, dep.avg_quarterly_balance, dep.is_salary_account,
      dep.status, dep.last_refreshed_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Collections Cases (Operational Hub)...');
  const collectionsCases = [
    {
      case_id: 'CASE-5501',
      customer_id: 'CUST-10245',
      case_status: 'PTP_ACTIVE',
      total_outstanding: 187000, // 42k card + 145k loan
      days_past_due: 38,
      collection_bucket: 'B2 (31-60)',
      risk_tier: 'MEDIUM',
      assigned_agent_id: 'AGENT-104 (Pooja Nair)',
      assigned_strategy: 'TELE_CALLING_ARRANGEMENT',
      ptp_status: 'PROMISED',
      ptp_date: '2026-10-09',
      ptp_amount: 22900,
      broken_ptp_count: 0,
      total_ptp_count: 2,
      ptp_reliability_score: 0.78,
      last_contact_date: '2026-09-28',
      last_contact_channel: 'PHONE',
      last_contact_outcome: 'CONNECTED_PROMISED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5502',
      customer_id: 'CUST-10482',
      case_status: 'OPEN',
      total_outstanding: 310000, // 110k card + 200k loan
      days_past_due: 72,
      collection_bucket: 'B3 (61-90)',
      risk_tier: 'HIGH',
      assigned_agent_id: 'AGENT-108 (Rohan Mehta)',
      assigned_strategy: 'INTENSIVE_TELE_OUTREACH',
      ptp_status: 'BROKEN',
      ptp_date: '2026-09-22',
      ptp_amount: 35000,
      broken_ptp_count: 2,
      total_ptp_count: 3,
      ptp_reliability_score: 0.33,
      last_contact_date: '2026-09-27',
      last_contact_channel: 'PHONE',
      last_contact_outcome: 'NO_ANSWER',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5503',
      customer_id: 'CUST-10733',
      case_status: 'LEGAL_REVIEW',
      total_outstanding: 520000,
      days_past_due: 105,
      collection_bucket: 'B4 (90+)',
      risk_tier: 'CRITICAL',
      assigned_agent_id: 'AGENT-112 (Suresh Rao)',
      assigned_strategy: 'HARDSHIP_RESTRUCTURING',
      ptp_status: 'BROKEN',
      ptp_date: '2026-08-30',
      ptp_amount: 50000,
      broken_ptp_count: 3,
      total_ptp_count: 4,
      ptp_reliability_score: 0.15,
      last_contact_date: '2026-09-18',
      last_contact_channel: 'PHONE',
      last_contact_outcome: 'CONNECTED_HARDSHIP_CITED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5504',
      customer_id: 'CUST-10901',
      case_status: 'OPEN',
      total_outstanding: 65000,
      days_past_due: 18,
      collection_bucket: 'B1 (1-30)',
      risk_tier: 'LOW',
      assigned_agent_id: 'DIGITAL_BOT',
      assigned_strategy: 'DIGITAL_NUDGE',
      ptp_status: 'NO_PTP',
      ptp_date: null,
      ptp_amount: null,
      broken_ptp_count: 0,
      total_ptp_count: 0,
      ptp_reliability_score: 0.90,
      last_contact_date: '2026-09-29',
      last_contact_channel: 'SMS',
      last_contact_outcome: 'DELIVERED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5505',
      customer_id: 'CUST-11204',
      case_status: 'OPEN',
      total_outstanding: 38000,
      days_past_due: 45,
      collection_bucket: 'B2 (31-60)',
      risk_tier: 'MEDIUM',
      assigned_agent_id: 'AGENT-104 (Pooja Nair)',
      assigned_strategy: 'TELE_CALLING_ARRANGEMENT',
      ptp_status: 'PROMISED',
      ptp_date: '2026-10-10',
      ptp_amount: 5900,
      broken_ptp_count: 1,
      total_ptp_count: 2,
      ptp_reliability_score: 0.50,
      last_contact_date: '2026-09-29',
      last_contact_channel: 'PHONE',
      last_contact_outcome: 'CONNECTED_PROMISED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5506',
      customer_id: 'CUST-11355',
      case_status: 'CLOSED',
      total_outstanding: 0,
      days_past_due: 0,
      collection_bucket: 'B0 (Current)',
      risk_tier: 'LOW',
      assigned_agent_id: null,
      assigned_strategy: 'SELF_SERVICE',
      ptp_status: 'HONORED',
      ptp_date: '2026-09-15',
      ptp_amount: 45000,
      broken_ptp_count: 0,
      total_ptp_count: 1,
      ptp_reliability_score: 0.98,
      last_contact_date: '2026-09-15',
      last_contact_channel: 'EMAIL',
      last_contact_outcome: 'PAID_IN_FULL',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5507',
      customer_id: 'CUST-11490',
      case_status: 'OPEN',
      total_outstanding: 180000,
      days_past_due: 28,
      collection_bucket: 'B1 (1-30)',
      risk_tier: 'LOW',
      assigned_agent_id: 'AGENT-108 (Rohan Mehta)',
      assigned_strategy: 'COURTESY_REMINDER',
      ptp_status: 'PROMISED',
      ptp_date: '2026-10-06',
      ptp_amount: 16800,
      broken_ptp_count: 0,
      total_ptp_count: 1,
      ptp_reliability_score: 0.85,
      last_contact_date: '2026-09-26',
      last_contact_channel: 'PHONE',
      last_contact_outcome: 'CONNECTED_PROMISED',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    },
    {
      case_id: 'CASE-5508',
      customer_id: 'CUST-11621',
      case_status: 'OPEN',
      total_outstanding: 92000,
      days_past_due: 52,
      collection_bucket: 'B2 (31-60)',
      risk_tier: 'MEDIUM',
      assigned_agent_id: 'AGENT-104 (Pooja Nair)',
      assigned_strategy: 'TELE_CALLING_ARRANGEMENT',
      ptp_status: 'BROKEN',
      ptp_date: '2026-09-20',
      ptp_amount: 19600,
      broken_ptp_count: 1,
      total_ptp_count: 1,
      ptp_reliability_score: 0.40,
      last_contact_date: '2026-09-25',
      last_contact_channel: 'WHATSAPP',
      last_contact_outcome: 'MESSAGE_READ_NO_REPLY',
      data_quality_status: 'VALID',
      last_refreshed_at: now
    }
  ];

  const insertCaseStmt = db.prepare(`
    INSERT INTO collections_cases (
      case_id, customer_id, case_status, total_outstanding,
      days_past_due, collection_bucket, risk_tier, assigned_agent_id,
      assigned_strategy, ptp_status, ptp_date, ptp_amount,
      broken_ptp_count, total_ptp_count, ptp_reliability_score,
      last_contact_date, last_contact_channel, last_contact_outcome,
      data_quality_status, last_refreshed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const cs of collectionsCases) {
    insertCaseStmt.run(
      cs.case_id, cs.customer_id, cs.case_status, cs.total_outstanding,
      cs.days_past_due, cs.collection_bucket, cs.risk_tier, cs.assigned_agent_id,
      cs.assigned_strategy, cs.ptp_status, cs.ptp_date, cs.ptp_amount,
      cs.broken_ptp_count, cs.total_ptp_count, cs.ptp_reliability_score,
      cs.last_contact_date, cs.last_contact_channel, cs.last_contact_outcome,
      cs.data_quality_status, cs.last_refreshed_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Contact History...');
  const contactHistory = [
    {
      interaction_id: 'INT-8801',
      customer_id: 'CUST-10245',
      channel: 'PHONE',
      direction: 'OUTBOUND',
      timestamp: '2026-09-28T18:14:00Z',
      agent_id: 'AGENT-104',
      outcome: 'CONNECTED_PROMISED',
      call_duration_seconds: 215,
      response_payload: 'Spoke with Rahul. Explained loan EMI delay due to corporate payroll change. Committed to clearing INR 22,900 on Oct 9.'
    },
    {
      interaction_id: 'INT-8802',
      customer_id: 'CUST-10245',
      channel: 'WHATSAPP',
      direction: 'OUTBOUND',
      timestamp: '2026-09-20T10:30:00Z',
      agent_id: 'SYSTEM_BOT',
      outcome: 'DELIVERED',
      call_duration_seconds: 0,
      response_payload: 'Payment reminder sent with instant UPI link. Read receipt confirmed.'
    },
    {
      interaction_id: 'INT-8803',
      customer_id: 'CUST-10482',
      channel: 'PHONE',
      direction: 'OUTBOUND',
      timestamp: '2026-09-27T15:20:00Z',
      agent_id: 'AGENT-108',
      outcome: 'NO_ANSWER',
      call_duration_seconds: 45,
      response_payload: 'Ringing no answer on primary mobile.'
    },
    {
      interaction_id: 'INT-8804',
      customer_id: 'CUST-10482',
      channel: 'PHONE',
      direction: 'OUTBOUND',
      timestamp: '2026-09-22T11:05:00Z',
      agent_id: 'AGENT-108',
      outcome: 'PROMISE_BROKEN',
      call_duration_seconds: 120,
      response_payload: 'Customer had promised payment by 22nd. Account review indicates zero funds deposited.'
    },
    {
      interaction_id: 'INT-8805',
      customer_id: 'CUST-10733',
      channel: 'PHONE',
      direction: 'INBOUND',
      timestamp: '2026-09-18T10:15:00Z',
      agent_id: 'AGENT-112',
      outcome: 'CONNECTED_HARDSHIP_CITED',
      call_duration_seconds: 380,
      response_payload: 'Customer called expressing severe distress. Cited spouse ICU admission and requested forbearance or 90-day moratorium.'
    },
    {
      interaction_id: 'INT-8806',
      customer_id: 'CUST-10901',
      channel: 'SMS',
      direction: 'OUTBOUND',
      timestamp: '2026-09-29T12:00:00Z',
      agent_id: 'SYSTEM_BOT',
      outcome: 'DELIVERED',
      call_duration_seconds: 0,
      response_payload: 'Gentle nudge SMS sent regarding Credit Card minimum due date.'
    }
  ];

  const insertContactStmt = db.prepare(`
    INSERT INTO contact_history (
      interaction_id, customer_id, channel, direction, timestamp,
      agent_id, outcome, call_duration_seconds, response_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of contactHistory) {
    insertContactStmt.run(
      c.interaction_id, c.customer_id, c.channel, c.direction, c.timestamp,
      c.agent_id, c.outcome, c.call_duration_seconds, c.response_payload
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Agent Notes (Unstructured Context)...');
  const agentNotes = [
    {
      note_id: 'NOTE-701',
      customer_id: 'CUST-10245',
      agent_id: 'AGENT-104',
      timestamp: '2026-09-28T18:22:00Z',
      note_category: 'PAYMENT_ARRANGEMENT',
      note_text: 'Rahul stated his employer shifted the monthly payroll cycle from the 1st to the 7th. He has agreed to clear 2 months overdue EMIs (INR 22,900) on 9th October. Requested SMS reminder 24 hours prior. Customer was cooperative and confirmed current address.',
      sentiment: 'POSITIVE',
      extracted_tags: JSON.stringify(['salary_cycle_delay', 'cooperative', 'ptp_oct_09'])
    },
    {
      note_id: 'NOTE-702',
      customer_id: 'CUST-10482',
      agent_id: 'AGENT-108',
      timestamp: '2026-09-22T14:10:00Z',
      note_category: 'BROKEN_PROMISE',
      note_text: 'Priya failed to honor PTP of INR 35,000 promised on Sep 22. Subsequent calls on 25th and 27th went unanswered. WhatsApp messages marked delivered but no response. Recommend assigning to senior field recovery agent or offering structured settlement.',
      sentiment: 'HOSTILE',
      extracted_tags: JSON.stringify(['broken_ptp', 'unreachable', 'escalate_field'])
    },
    {
      note_id: 'NOTE-703',
      customer_id: 'CUST-10733',
      agent_id: 'AGENT-112',
      timestamp: '2026-09-18T10:45:00Z',
      note_category: 'HARDSHIP_DISPUTE',
      note_text: 'CRITICAL VULNERABILITY: Vikram broke down on the call. Showed proof of emergency hospitalization for his spouse. Business textile orders were cancelled due to supply disruption. He has no immediate liquidity. DO NOT trigger automated legal notices. Flagged for Vulnerable Customer Committee restructuring review.',
      sentiment: 'DISTRESSED',
      extracted_tags: JSON.stringify(['medical_emergency', 'hardship_flag', 'restructure_request', 'vulnerable'])
    },
    {
      note_id: 'NOTE-704',
      customer_id: 'CUST-10901',
      agent_id: 'SYSTEM_BOT',
      timestamp: '2026-09-29T12:05:00Z',
      note_category: 'GENERAL',
      note_text: 'Automated digital nudge dispatched. Customer has spotless 5-year repayment record. Likely travel or inadvertent delay.',
      sentiment: 'NEUTRAL',
      extracted_tags: JSON.stringify(['low_risk', 'first_time_delinquent'])
    }
  ];

  const insertNoteStmt = db.prepare(`
    INSERT INTO agent_notes (
      note_id, customer_id, agent_id, timestamp, note_category,
      note_text, sentiment, extracted_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const n of agentNotes) {
    insertNoteStmt.run(
      n.note_id, n.customer_id, n.agent_id, n.timestamp, n.note_category,
      n.note_text, n.sentiment, n.extracted_tags
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Call Transcripts...');
  const callTranscripts = [
    {
      transcript_id: 'TR-901',
      customer_id: 'CUST-10245',
      call_date: '2026-09-28',
      agent_id: 'AGENT-104 (Pooja Nair)',
      duration_seconds: 215,
      raw_transcript: `Agent: Hello, good evening. May I please speak with Mr. Rahul Kumar?
Customer: Yes, this is Rahul speaking. Who is this?
Agent: Good evening Mr. Kumar, I am Pooja calling from CollectIQ on behalf of Apex Bank regarding your Personal Loan account ending in 40291.
Customer: Ah, yes Pooja. I know why you are calling. I am sorry about the delay. My company changed our payroll schedule from the 1st of the month to the 7th starting this quarter.
Agent: Thank you for sharing that Rahul. We noticed your account has two overdue EMIs totaling INR 22,900 and is currently 38 days past due.
Customer: Yes, I can make the full payment of INR 22,900 on Friday, October 9th right after my salary hits my account. Could you please send me a payment link on my WhatsApp?
Agent: Absolutely, Mr. Kumar. I am recording a Promise-to-Pay for INR 22,900 on October 9th. We will send the secure payment link to your registered mobile number on the 8th as a gentle reminder.
Customer: That would be perfect. Thank you so much for your understanding Pooja.
Agent: You're welcome, Mr. Kumar. Have a wonderful evening.`,
      ai_summary: 'Customer acknowledged two overdue loan EMIs (INR 22,900) caused by an employer payroll date transition. Agreed to a formal Promise-to-Pay for the full amount on October 9th, 2026 via WhatsApp payment link.',
      customer_intent: 'WILLING_TO_PAY',
      ptp_extracted_date: '2026-10-09',
      ptp_extracted_amount: 22900,
      objections_raised: JSON.stringify(['Employer payroll date changed from 1st to 7th']),
      hardship_indicators: JSON.stringify(['Temporary cashflow timing mismatch']),
      follow_up_action: 'Send WhatsApp payment link on Oct 8th; verify receipt on morning of Oct 9th.'
    },
    {
      transcript_id: 'TR-902',
      customer_id: 'CUST-10733',
      call_date: '2026-09-18',
      agent_id: 'AGENT-112 (Suresh Rao)',
      duration_seconds: 380,
      raw_transcript: `Agent: Namaste, this is Suresh from Apex Collections. Am I speaking with Mr. Vikram Patel of Patel Textiles?
Customer: Yes Suresh, please... I am at the hospital right now.
Agent: Oh, Mr. Patel, I am sorry to interrupt. We have an urgent notice regarding your Business Loan account which has crossed 100 days overdue.
Customer: Suresh bhai, my wife had an emergency surgery two weeks ago. I have spent over 4 lakhs in medical bills. My factory orders are on hold. I don't have money to eat properly right now, how can I pay 1.2 lakhs EMI? I want to pay my debt, I am not running away, but I need 3 months breathing room!
Agent: Mr. Patel, thank you for being honest with us. Please take care of your wife's health first. Under our Vulnerable Customer Hardship policy, I am placing an immediate 14-day recovery hold on your file and submitting your case to our Hardship Relief committee for loan restructuring.
Customer: God bless you Suresh. I have hospital discharge summaries and medical bills. Where can I send them?
Agent: I am sending you a secure portal link where you can upload the medical documents whenever you are free. No recovery agent will visit your premises during this review.`,
      ai_summary: 'Customer cited severe medical hardship due to emergency hospitalization of spouse and business disruption. Expressed strong intent to honor debt once stabilized but requested 90-day moratorium or EMI restructuring.',
      customer_intent: 'HARDSHIP',
      ptp_extracted_date: null,
      ptp_extracted_amount: null,
      objections_raised: JSON.stringify(['Severe medical emergency', 'Hospitalization costs exceeding 4 lakhs', 'Zero immediate liquidity']),
      hardship_indicators: JSON.stringify(['Critical illness in immediate family', 'Acute business cashflow collapse']),
      follow_up_action: 'Flag hardship_flag=1; freeze outbound collection calls; request medical bills for restructuring concession.'
    }
  ];

  const insertTrStmt = db.prepare(`
    INSERT INTO call_transcripts (
      transcript_id, customer_id, call_date, agent_id, duration_seconds,
      raw_transcript, ai_summary, customer_intent, ptp_extracted_date,
      ptp_extracted_amount, objections_raised, hardship_indicators, follow_up_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tr of callTranscripts) {
    insertTrStmt.run(
      tr.transcript_id, tr.customer_id, tr.call_date, tr.agent_id, tr.duration_seconds,
      tr.raw_transcript, tr.ai_summary, tr.customer_intent, tr.ptp_extracted_date,
      tr.ptp_extracted_amount, tr.objections_raised, tr.hardship_indicators, tr.follow_up_action
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Next Best Action (NBA) Recommendations...');
  const nbaRecommendations = [
    {
      recommendation_id: 'NBA-301',
      customer_id: 'CUST-10245',
      case_id: 'CASE-5501',
      recommended_action: 'SCHEDULE_PHONE_CONTACT',
      why_rationale: 'Promise-to-pay date (October 9) is approaching within 5 days; previous phone contact yielded 100% engagement; customer requested reminder.',
      supporting_factors: JSON.stringify([
        'Active PTP commitment of INR 22,900 on Oct 9',
        'Previous phone contact had positive engagement score (0.85)',
        'Customer has regular salary deposits in savings account',
        'No broken promises in preceding 6 months'
      ]),
      data_points_used: JSON.stringify(['collections_cases.ptp_date', 'agent_notes.sentiment', 'deposit_accounts.is_salary_account', 'contact_history']),
      confidence_score: 0.89,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: 0,
      review_status: 'PENDING',
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: now
    },
    {
      recommendation_id: 'NBA-302',
      customer_id: 'CUST-10482',
      case_id: 'CASE-5502',
      recommended_action: 'ASSIGN_SPECIALIST_AGENT',
      why_rationale: 'Customer has 2 consecutive broken promises; standard digital/phone nudges failed; delinquency rolling into B3 (72 DPD).',
      supporting_factors: JSON.stringify([
        '2 broken PTPs totaling INR 70,000',
        'Last 3 outbound phone attempts unanswered',
        'High outstanding debt across Card and Auto loan (INR 3,10,000)'
      ]),
      data_points_used: JSON.stringify(['collections_cases.broken_ptp_count', 'collections_cases.days_past_due', 'loan_accounts.overdue_amount']),
      confidence_score: 0.92,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: 0,
      review_status: 'PENDING',
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: now
    },
    {
      recommendation_id: 'NBA-303',
      customer_id: 'CUST-10733',
      case_id: 'CASE-5503',
      recommended_action: 'OFFER_PAYMENT_PLAN_DISCUSSION',
      why_rationale: 'ETHICAL GUARDRAIL TRIGGERED: Acute medical hardship cited in transcript TR-902. Avoid adversarial recovery. Propose 60-day EMI moratorium or term extension.',
      supporting_factors: JSON.stringify([
        'Severe medical hardship confirmed in call transcript',
        'Customer proactively engaged and offered hospital documentation',
        'Business unit temporarily disrupted'
      ]),
      data_points_used: JSON.stringify(['customers.hardship_flag', 'call_transcripts.hardship_indicators', 'collections_cases.risk_tier']),
      confidence_score: 0.96,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: 1,
      review_status: 'PENDING',
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: now
    }
  ];

  const insertNbaStmt = db.prepare(`
    INSERT INTO nba_recommendations (
      recommendation_id, customer_id, case_id, recommended_action,
      why_rationale, supporting_factors, data_points_used,
      confidence_score, model_version, is_hardship_escalation,
      review_status, reviewer_notes, reviewed_by, reviewed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const nba of nbaRecommendations) {
    insertNbaStmt.run(
      nba.recommendation_id, nba.customer_id, nba.case_id, nba.recommended_action,
      nba.why_rationale, nba.supporting_factors, nba.data_points_used,
      nba.confidence_score, nba.model_version, nba.is_hardship_escalation,
      nba.review_status, nba.reviewer_notes, nba.reviewed_by, nba.reviewed_at, nba.created_at
    );
  }

  console.log('[CollectIQ Data Factory] Seeding Audit Logs (Governance Ledger)...');
  const auditLogs = [
    {
      log_id: 'AUD-001',
      timestamp: '2026-10-02T10:00:00Z',
      user_id: 'USER-ADMIN-01',
      user_role: 'ADMIN',
      action_type: 'DATA_PRODUCT_FACTORY_REFRESH',
      entity_type: 'SYSTEM',
      entity_id: 'PIPELINE-01',
      query_text: 'EXECUTE data_cleansing_and_deduplication',
      response_summary: 'Merged 11 raw records into 8 golden collections profiles with 98.2% average confidence.',
      decision: 'EXECUTED',
      client_ip: '127.0.0.1'
    },
    {
      log_id: 'AUD-002',
      timestamp: '2026-10-02T11:15:00Z',
      user_id: 'USER-MGR-02',
      user_role: 'COLLECTIONS_MANAGER',
      action_type: 'NL_QUERY',
      entity_type: 'AI_ASSISTANT',
      entity_id: 'NL-881',
      query_text: 'Which customers are most likely to break a promise to pay?',
      response_summary: 'Generated SQL query on collections_cases JOIN customers filtering by broken_ptp_count > 0 AND ptp_reliability_score < 0.5',
      decision: 'APPROVED',
      client_ip: '192.168.1.45'
    },
    {
      log_id: 'AUD-003',
      timestamp: '2026-10-02T11:30:00Z',
      user_id: 'USER-AGENT-104',
      user_role: 'COLLECTIONS_AGENT',
      action_type: 'VIEW_CUSTOMER_360',
      entity_type: 'CUSTOMER',
      entity_id: 'CUST-10245',
      query_text: 'SELECT * FROM collections_360 WHERE customer_id = "CUST-10245"',
      response_summary: 'Agent accessed unified profile and agent notes for Rahul Kumar.',
      decision: 'EXECUTED',
      client_ip: '192.168.1.88'
    }
  ];

  const insertAuditStmt = db.prepare(`
    INSERT INTO audit_logs (
      log_id, timestamp, user_id, user_role, action_type,
      entity_type, entity_id, query_text, response_summary,
      decision, client_ip
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const aud of auditLogs) {
    insertAuditStmt.run(
      aud.log_id, aud.timestamp, aud.user_id, aud.user_role, aud.action_type,
      aud.entity_type, aud.entity_id, aud.query_text, aud.response_summary,
      aud.decision, aud.client_ip
    );
  }

  console.log('[CollectIQ Data Factory] Pipeline execution completed successfully!');
  console.log(`Golden Customers: ${customers.length} records`);
  console.log(`Raw Messy Feeds: ${rawFeeds.length} records`);
  console.log(`Collections Cases: ${collectionsCases.length} records`);
}
