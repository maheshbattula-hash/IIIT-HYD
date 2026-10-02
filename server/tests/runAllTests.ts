import { normalizePhone, stringSimilarity } from '../src/db/seed.js';
import { db, queryAll, queryOne } from '../src/db/database.js';
import { validateSqlSafety, processNLQuery } from '../src/ai/nlToSqlEngine.js';
import { generateNextBestAction, saveNBAReviewDecision } from '../src/ai/nbaEngine.js';
import { maskCustomerPII } from '../src/middleware/auth.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('==========================================================');
  console.log(' COLLECTIQ AUTOMATED COMPREHENSIVE TEST SUITE');
  console.log('==========================================================');

  // TEST SUITE 1: Customer ID Matching & Deduplication
  console.log('\n--- 1. Customer Matching & Phone Normalization ---');
  assert(normalizePhone('09876543210') === '+919876543210', 'Normalizes leading 0 to +91');
  assert(normalizePhone('+91 98765-43210') === '+919876543210', 'Strips dashes and spaces for E.164');
  assert(normalizePhone('9876543210') === '+919876543210', 'Appends +91 to 10-digit number');

  assert(stringSimilarity('Rahul Kumar', 'Rahul K.') > 0.85, 'Fuzzy match detects name abbreviation');
  assert(stringSimilarity('Priya Sharma', 'Priya S') > 0.85, 'Fuzzy match detects first name + initial');
  assert(stringSimilarity('Vikram Patel', 'Anita Desai') < 0.3, 'Differentiates distinct customer names');

  // Verify raw staging records deduplicated to CUST-10245
  const rawClusters = queryAll<any>(
    `SELECT COUNT(*) as count FROM raw_staging_customers WHERE resolved_customer_id = 'CUST-10245'`
  );
  assert(Number(rawClusters[0].count) >= 3, 'Merged at least 3 raw feed variants into Rahul Kumar (CUST-10245)');

  // TEST SUITE 2: Data Quality & Schema Constraints
  console.log('\n--- 2. Data Quality & Data Contract Checks ---');
  const invalidCust = queryAll<any>(
    `SELECT customer_id FROM customers WHERE customer_id NOT LIKE 'CUST-%' OR primary_phone NOT LIKE '+%'`
  );
  assert(invalidCust.length === 0, '100% validity: all customer IDs and phone formats match contract schema');

  const zeroDpdCases = queryAll<any>(`SELECT COUNT(*) as c FROM collections_cases WHERE days_past_due < 0`);
  assert(Number(zeroDpdCases[0].c) === 0, 'DPD values are non-negative');

  // TEST SUITE 3: Controlled NL-to-SQL & Forbidden SQL Blocking
  console.log('\n--- 3. Controlled NL-to-SQL AST Safety & Operation Whitelist ---');
  assert(validateSqlSafety('SELECT * FROM customers WHERE customer_id = "CUST-10245"').isValid, 'Allows safe SELECT query');
  assert(validateSqlSafety('WITH summary AS (SELECT * FROM collections_cases) SELECT * FROM summary').isValid, 'Allows safe WITH SELECT query');

  assert(!validateSqlSafety('DROP TABLE customers;').isValid, 'BLOCKED: DROP TABLE is strictly forbidden');
  assert(!validateSqlSafety('DELETE FROM collections_cases WHERE dpd > 30;').isValid, 'BLOCKED: DELETE is strictly forbidden');
  assert(!validateSqlSafety('UPDATE customers SET consent_status = "REVOKED";').isValid, 'BLOCKED: UPDATE is strictly forbidden');
  assert(!validateSqlSafety('INSERT INTO customers VALUES ("1", "Hack");').isValid, 'BLOCKED: INSERT is strictly forbidden');
  assert(!validateSqlSafety('ALTER TABLE collections_cases ADD COLUMN hack TEXT;').isValid, 'BLOCKED: ALTER is strictly forbidden');
  assert(!validateSqlSafety('TRUNCATE TABLE customers;').isValid, 'BLOCKED: TRUNCATE is strictly forbidden');
  assert(!validateSqlSafety('PRAGMA table_info(customers);').isValid, 'BLOCKED: PRAGMA inspection is forbidden');

  // TEST SUITE 4: AI Out-of-Domain Guardrail (No Hallucination)
  console.log('\n--- 4. Out-of-Domain Guardrail & Hallucination Prevention ---');
  const outOfDomain = await processNLQuery('What is the weather forecast for tomorrow in Mumbai?');
  assert(outOfDomain.isOutsideDomain === true, 'Intercepted out-of-domain query without hallucination');
  assert(
    outOfDomain.answer === "I can't answer this because the requested information is outside the available Collections data.",
    'Returns exact safety boundary text'
  );
  assert(outOfDomain.sql === '', 'Zero SQL generated for out-of-domain request');

  // TEST SUITE 5: Explainable Next Best Action & Hardship Guardrail
  console.log('\n--- 5. Explainable Next Best Action & Ethical AI ---');
  // Rahul Kumar (CUST-10245): upcoming PTP commitment
  const nbaRahul = generateNextBestAction('CUST-10245');
  assert(nbaRahul.recommended_action === 'Schedule phone contact', 'Recommends phone contact for approaching PTP');
  assert(nbaRahul.confidence_score > 0.8, 'High confidence score (> 0.80)');
  assert(nbaRahul.why_rationale.length > 20, 'Generates transparent explainable why_rationale');

  // Vikram Patel (CUST-10733): Medical Hardship flagged
  const nbaVikram = generateNextBestAction('CUST-10733');
  assert(nbaVikram.is_hardship_escalation === true, 'ETHICAL GUARDRAIL: Flags hardship escalation');
  assert(
    nbaVikram.recommended_action.includes('payment-plan') || nbaVikram.recommended_action.includes('pause'),
    'Recommends compassionate pause/forbearance rather than aggressive pursuit'
  );

  // Human Review Decision Logging
  const reviewResult = saveNBAReviewDecision(
    nbaRahul.recommendation_id,
    'APPROVED',
    'USER-AGENT-104',
    'COLLECTIONS_AGENT',
    undefined,
    'Confirmed contact window for Friday'
  );
  assert(reviewResult.success === true, 'Successfully saved human review decision');

  const loggedAudit = queryOne<any>(
    `SELECT * FROM audit_logs WHERE entity_id = ?`,
    [nbaRahul.recommendation_id]
  );
  assert(loggedAudit !== undefined && loggedAudit.decision === 'APPROVED', 'Audit log inscribed with review decision');

  // TEST SUITE 6: RBAC & PII Masking
  console.log('\n--- 6. Role-Based Access Control & PII Masking ---');
  const sampleCustomer = {
    customer_id: 'CUST-10245',
    name: 'Rahul Kumar',
    primary_phone: '+919876543210',
    email: 'rahul.kumar@gmail.com',
    pan_number: 'ABCDE1234F',
    city: 'Bangalore',
  };

  const maskedForAnalyst = maskCustomerPII(sampleCustomer, 'ANALYST');
  assert(maskedForAnalyst.primary_phone.includes('*****'), 'Analyst role has masked primary phone');
  assert(maskedForAnalyst.email.includes('****@'), 'Analyst role has masked email');
  assert(maskedForAnalyst.pan_number.startsWith('XXXXX'), 'Analyst role has masked PAN identifier');

  const unmaskedForManager = maskCustomerPII(sampleCustomer, 'COLLECTIONS_MANAGER');
  assert(unmaskedForManager.primary_phone === '+919876543210', 'Manager role retains full verified contact info');

  // SUMMARY
  console.log('\n==========================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('==========================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed with flying colors!\n');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
