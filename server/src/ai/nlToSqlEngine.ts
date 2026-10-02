import { getAIProvider } from './aiProvider.js';
import { executeReadOnlyQuery, execute } from '../db/database.js';

export interface NLQueryResponse {
  answer: string;
  dataUsed: string[];
  filtersUnderstood: string[];
  sql: string;
  records: any[];
  rowCount: number;
  explanation: string;
  suggestedFollowUps: string[];
  isOutsideDomain?: boolean;
}

const ALLOWED_TABLES = new Set([
  'customers',
  'card_accounts',
  'loan_accounts',
  'deposit_accounts',
  'collections_cases',
  'contact_history',
  'agent_notes',
  'call_transcripts',
  'nba_recommendations',
  'raw_staging_customers'
]);

export function validateSqlSafety(sql: string): { isValid: boolean; error?: string } {
  const cleanSql = sql.trim().replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  if (!cleanSql) {
    return { isValid: false, error: 'Empty SQL query generated.' };
  }

  // Check forbidden destructive statements
  const forbiddenRegex = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|ATTACH|DETACH|VACUUM|PRAGMA|EXEC|EXECUTE)\b/i;
  if (forbiddenRegex.test(cleanSql)) {
    return { isValid: false, error: 'Prohibited SQL operation: Only read-only SELECT queries are allowed.' };
  }

  // Ensure starts with SELECT or WITH
  const firstWord = cleanSql.split(/\s+/)[0]?.toUpperCase();
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    return { isValid: false, error: 'Query must start with SELECT or WITH.' };
  }

  return { isValid: true };
}

export async function processNLQuery(
  question: string,
  user: { id: string; role: string } = { id: 'ANONYMOUS', role: 'COLLECTIONS_MANAGER' }
): Promise<NLQueryResponse> {
  const provider = getAIProvider();
  const nlResult = await provider.generateNlToSql(question);

  if (nlResult.isOutsideDomain || !nlResult.sql) {
    // Intercept out of domain query gracefully
    return {
      answer: "I can't answer this because the requested information is outside the available Collections data.",
      dataUsed: [],
      filtersUnderstood: [],
      sql: '',
      records: [],
      rowCount: 0,
      explanation: 'The query does not pertain to bank accounts, loans, credit cards, delinquency buckets, promise-to-pay status, or customer collections history.',
      suggestedFollowUps: nlResult.suggestedFollowUps,
      isOutsideDomain: true
    };
  }

  // Validate SQL safety
  const safetyCheck = validateSqlSafety(nlResult.sql);
  if (!safetyCheck.isValid) {
    throw new Error(safetyCheck.error || 'SQL validation failed.');
  }

  // Execute safe query against database
  let records: any[] = [];
  let rowCount = 0;
  try {
    const execResult = executeReadOnlyQuery(nlResult.sql);
    records = execResult.rows;
    rowCount = execResult.rowCount;
  } catch (err: any) {
    console.error('SQL Execution error:', err);
    throw new Error(`Failed to execute generated query: ${err.message}`);
  }

  // Construct comprehensive natural language answer based on records
  let naturalAnswer = nlResult.explanation;
  if (records.length > 0) {
    naturalAnswer = `${nlResult.explanation} Found ${rowCount} relevant record(s).`;
  } else {
    naturalAnswer = `${nlResult.explanation} No records currently match this specific criteria.`;
  }

  // Record audit log for compliance
  try {
    execute(
      `INSERT INTO audit_logs (log_id, timestamp, user_id, user_role, action_type, entity_type, query_text, response_summary, decision)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `AUD-${Date.now().toString().slice(-6)}`,
        new Date().toISOString(),
        user.id,
        user.role,
        'NL_TO_SQL_QUERY',
        'COLLECTIONS_DATA',
        question,
        `Executed SQL: ${nlResult.sql.slice(0, 100)}... Rows returned: ${rowCount}`,
        'APPROVED'
      ]
    );
  } catch (auditErr) {
    console.error('Audit log write error:', auditErr);
  }

  return {
    answer: naturalAnswer,
    dataUsed: nlResult.dataPointsUsed,
    filtersUnderstood: nlResult.filters,
    sql: nlResult.sql,
    records: records.slice(0, 25), // Safe limit for response
    rowCount,
    explanation: nlResult.explanation,
    suggestedFollowUps: nlResult.suggestedFollowUps
  };
}
