export type UserRole = 'ADMIN' | 'COLLECTIONS_MANAGER' | 'COLLECTIONS_AGENT' | 'ANALYST';

export interface AgentStep {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  detail: string;
  dataSnippet?: any;
}

export interface CustomerProfile {
  customer_id: string;
  name: string;
  primary_phone: string;
  secondary_phone?: string | null;
  email?: string | null;
  pan_number?: string | null;
  customer_segment: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  consent_status: string;
  preferred_channel?: string;
  best_time_to_contact?: string;
  credit_bureau_score?: number;
  employment_status?: string;
  hardship_flag: number;
  hardship_reason?: string | null;
  source_system: string;
  data_quality_score: number;
  match_confidence: number;
  last_refreshed_at: string;
  // joined case fields
  case_id?: string;
  case_status?: string;
  total_outstanding?: number;
  days_past_due?: number;
  collection_bucket?: string;
  risk_tier?: string;
  ptp_status?: string;
  ptp_date?: string | null;
  ptp_amount?: number | null;
  broken_ptp_count?: number;
  ptp_reliability_score?: number;
  assigned_strategy?: string;
}

export interface CardAccount {
  card_account_id: string;
  customer_id: string;
  card_type: string;
  card_number_masked: string;
  credit_limit: number;
  current_balance: number;
  minimum_amount_due: number;
  payment_due_date: string;
  apr: number;
  status: string;
  data_quality_status: string;
  last_refreshed_at: string;
}

export interface LoanAccount {
  loan_account_id: string;
  customer_id: string;
  loan_type: string;
  is_secured: number;
  original_principal: number;
  outstanding_principal: number;
  emi_amount: number;
  tenure_months: number;
  remaining_emis: number;
  overdue_amount: number;
  dpd: number;
  interest_rate: number;
  status: string;
  data_quality_status: string;
  last_refreshed_at: string;
}

export interface DepositAccount {
  deposit_account_id: string;
  customer_id: string;
  account_type: string;
  account_number_masked: string;
  current_balance: number;
  avg_quarterly_balance: number;
  is_salary_account: number;
  status: string;
  last_refreshed_at: string;
}

export interface CollectionsCase {
  case_id: string;
  customer_id: string;
  case_status: string;
  total_outstanding: number;
  days_past_due: number;
  collection_bucket: string;
  risk_tier: string;
  assigned_agent_id: string;
  assigned_strategy: string;
  ptp_status: string;
  ptp_date?: string | null;
  ptp_amount?: number | null;
  broken_ptp_count: number;
  total_ptp_count: number;
  ptp_reliability_score: number;
  last_contact_date?: string | null;
  last_contact_channel?: string | null;
  last_contact_outcome?: string | null;
  data_quality_status: string;
  last_refreshed_at: string;
}

export interface ContactInteraction {
  interaction_id: string;
  customer_id: string;
  channel: string;
  direction: string;
  timestamp: string;
  agent_id?: string;
  outcome: string;
  call_duration_seconds: number;
  response_payload?: string;
}

export interface AgentNote {
  note_id: string;
  customer_id: string;
  agent_id: string;
  timestamp: string;
  note_category: string;
  note_text: string;
  sentiment?: string;
  extracted_tags?: string;
}

export interface CallTranscript {
  transcript_id: string;
  customer_id: string;
  call_date: string;
  agent_id: string;
  duration_seconds: number;
  raw_transcript: string;
  ai_summary?: string;
  customer_intent?: string;
  ptp_extracted_date?: string | null;
  ptp_extracted_amount?: number | null;
  objections_raised?: string;
  hardship_indicators?: string;
  follow_up_action?: string;
}

export interface NBARecommendation {
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

export interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string;
  user_role: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  query_text?: string;
  response_summary?: string;
  decision?: string;
  client_ip?: string;
}

export interface RetrievedSource {
  sourceType: 'AGENT_NOTE' | 'CALL_TRANSCRIPT' | 'DATA_CONTRACT' | 'UPLOADED_DOC';
  id: string;
  customerId?: string;
  authorOrAgent: string;
  dateOrTimestamp: string;
  snippet: string;
  relevanceScore: number;
}
