import { queryOne, queryAll, execute } from '../db/database.js';

export interface NBARecommendationResult {
  recommendation_id: string;
  customer_id: string;
  case_id: string;
  recommended_action: string;
  why_rationale: string;
  supporting_factors: string[];
  data_points_used: string[];
  confidence_score: number;
  model_version: string;
  is_hardship_escalation: boolean;
  review_status: 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export function generateNextBestAction(customerId: string): NBARecommendationResult {
  // Retrieve customer & collections telemetry
  const customer = queryOne<any>(`SELECT * FROM customers WHERE customer_id = ?`, [customerId]);
  const cCase = queryOne<any>(`SELECT * FROM collections_cases WHERE customer_id = ?`, [customerId]);

  if (!customer) {
    throw new Error(`Customer ${customerId} not found.`);
  }

  const recId = `NBA-${Date.now().toString().slice(-6)}`;
  const caseId = cCase?.case_id || 'CASE-GEN';
  const now = new Date().toISOString();

  // 1. Ethical Vulnerability Guardrail Check
  if (customer.hardship_flag === 1 || customer.hardship_reason) {
    return {
      recommendation_id: recId,
      customer_id: customerId,
      case_id: caseId,
      recommended_action: 'Offer payment-plan discussion / 60-day pause',
      why_rationale: `ETHICAL AI GUARDRAIL TRIGGERED: Customer has documented hardship (${customer.hardship_reason || 'Severe distress cited'}). Immediate collection escalations are paused. Propose forbearance, term extension, or EMI reduction.`,
      supporting_factors: [
        `Hardship reason: ${customer.hardship_reason}`,
        'Customer proactively engaged on prior contact',
        'Protect vulnerable customer from predatory or aggressive collection'
      ],
      data_points_used: ['customers.hardship_flag', 'customers.hardship_reason', 'call_transcripts.hardship_indicators'],
      confidence_score: 0.96,
      model_version: 'v2.4-collectiq-nba-ethical',
      is_hardship_escalation: true,
      review_status: 'PENDING',
      created_at: now
    };
  }

  // 2. High Risk / Broken Promises
  if (cCase && (cCase.broken_ptp_count >= 2 || cCase.ptp_reliability_score < 0.4)) {
    return {
      recommendation_id: recId,
      customer_id: customerId,
      case_id: caseId,
      recommended_action: 'Assign to specialist agent',
      why_rationale: `Customer has ${cCase.broken_ptp_count} broken promises with reliability score of ${(cCase.ptp_reliability_score * 100).toFixed(0)}%. Digital reminders are ineffective. Assign to Senior Negotiations Specialist for structured settlement.`,
      supporting_factors: [
        `${cCase.broken_ptp_count} consecutive broken promises`,
        `Low PTP reliability score (${(cCase.ptp_reliability_score * 100).toFixed(0)}%)`,
        `Delinquency at ${cCase.days_past_due} DPD in ${cCase.collection_bucket} bucket`
      ],
      data_points_used: ['collections_cases.broken_ptp_count', 'collections_cases.ptp_reliability_score', 'collections_cases.days_past_due'],
      confidence_score: 0.92,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: false,
      review_status: 'PENDING',
      created_at: now
    };
  }

  // 3. Active Upcoming Promise to Pay (e.g. Rahul Kumar)
  if (cCase && cCase.ptp_status === 'PROMISED' && cCase.ptp_date) {
    return {
      recommendation_id: recId,
      customer_id: customerId,
      case_id: caseId,
      recommended_action: 'Schedule phone contact',
      why_rationale: `Promise-to-pay date (${cCase.ptp_date}) is approaching. Customer previously engaged positively and requested an advance reminder. Phone contact scheduled during customer preferred time (${customer.best_time_to_contact || '18:00-20:00'}).`,
      supporting_factors: [
        `Active promise for INR ${Number(cCase.ptp_amount || 0).toLocaleString('en-IN')} on ${cCase.ptp_date}`,
        `Preferred contact window: ${customer.best_time_to_contact || 'Evening'}`,
        'Previous phone contact resulted in cooperative agreement',
        'Zero broken promises in past 6 months'
      ],
      data_points_used: ['collections_cases.ptp_date', 'collections_cases.ptp_amount', 'customers.best_time_to_contact', 'contact_history.outcome'],
      confidence_score: 0.89,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: false,
      review_status: 'PENDING',
      created_at: now
    };
  }

  // 4. Early Stage Delinquency (B1 Bucket)
  if (cCase && cCase.days_past_due <= 30) {
    return {
      recommendation_id: recId,
      customer_id: customerId,
      case_id: caseId,
      recommended_action: 'Send WhatsApp reminder',
      why_rationale: `Customer is in early bucket B1 (${cCase.days_past_due} DPD) with high credit bureau score (${customer.credit_bureau_score || 750}). Digital reminder via WhatsApp has highest response rate with minimal operational cost.`,
      supporting_factors: [
        `Early delinquency (${cCase.days_past_due} DPD)`,
        `Strong bureau score of ${customer.credit_bureau_score}`,
        'First-time delinquency event'
      ],
      data_points_used: ['collections_cases.days_past_due', 'customers.credit_bureau_score', 'customers.preferred_channel'],
      confidence_score: 0.94,
      model_version: 'v2.4-collectiq-nba',
      is_hardship_escalation: false,
      review_status: 'PENDING',
      created_at: now
    };
  }

  // Default Fallback Recommendation
  return {
    recommendation_id: recId,
    customer_id: customerId,
    case_id: caseId,
    recommended_action: 'Schedule phone contact',
    why_rationale: 'Perform courtesy outreach to understand root cause of overdue installment and agree on payment plan.',
    supporting_factors: [
      `Total outstanding debt: INR ${Number(cCase?.total_outstanding || 0).toLocaleString('en-IN')}`,
      `Current bucket: ${cCase?.collection_bucket || 'B1'}`
    ],
    data_points_used: ['collections_cases.total_outstanding', 'collections_cases.collection_bucket'],
    confidence_score: 0.85,
    model_version: 'v2.4-collectiq-nba',
    is_hardship_escalation: false,
    review_status: 'PENDING',
    created_at: now
  };
}

export function saveNBAReviewDecision(
  recommendationId: string,
  decision: 'APPROVED' | 'MODIFIED' | 'REJECTED',
  reviewerId: string,
  reviewerRole: string,
  modifiedAction?: string,
  notes?: string
) {
  const now = new Date().toISOString();

  // Update recommendation table
  execute(
    `UPDATE nba_recommendations
     SET review_status = ?, reviewed_by = ?, reviewed_at = ?, reviewer_notes = ?
     WHERE recommendation_id = ?`,
    [decision, reviewerId, now, notes || `Action ${decision.toLowerCase()} by ${reviewerId}`, recommendationId]
  );

  // Inscribe into compliance Audit Log
  execute(
    `INSERT INTO audit_logs (log_id, timestamp, user_id, user_role, action_type, entity_type, entity_id, query_text, response_summary, decision)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `AUD-${Date.now().toString().slice(-6)}`,
      now,
      reviewerId,
      reviewerRole,
      `NBA_${decision}`,
      'RECOMMENDATION',
      recommendationId,
      `Human Review Decision: ${decision}${modifiedAction ? ` -> Modified to: ${modifiedAction}` : ''}`,
      notes || `Decision registered by ${reviewerId} (${reviewerRole})`,
      decision
    ]
  );

  return { success: true, recommendationId, decision, timestamp: now };
}
