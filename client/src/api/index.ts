import { UserRole } from '../types';

let currentRole: UserRole = 'COLLECTIONS_MANAGER';

export function setApiRole(role: UserRole) {
  currentRole = role;
}

export function getApiRole(): UserRole {
  return currentRole;
}

const API_BASE = '/api';

async function fetchWithRole(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-collectiq-role': currentRole,
    'x-collectiq-user-id': `USER-${currentRole}-01`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => fetchWithRole('/health'),

  // Customers & Collections 360
  getCustomers: () => fetchWithRole('/customers'),
  getCustomer360: (id: string) => fetchWithRole(`/customers/${id}`),

  // Collections Cases
  getCollectionsCases: (params?: { bucket?: string; risk?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithRole(`/collections${query ? `?${query}` : ''}`);
  },

  // Analytics
  getAnalytics: () => fetchWithRole('/analytics'),

  // Data Quality & Contract
  getDataQuality: () => fetchWithRole('/data-quality'),

  // AI Assistant Studio
  askAI: (data: { question: string; attachments?: any[]; customerId?: string }) =>
    fetchWithRole('/ai/query', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Agent Studio
  runAgentTask: (data: { taskType: string; customerId: string; parameters?: any }) =>
    fetchWithRole('/ai/agent-task', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Next Best Action (NBA)
  getNBARecommendation: (customerId: string) =>
    fetchWithRole('/ai/recommendation', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),

  submitNBAReview: (data: {
    recommendationId: string;
    decision: 'APPROVED' | 'MODIFIED' | 'REJECTED';
    modifiedAction?: string;
    notes?: string;
  }) =>
    fetchWithRole('/ai/nba-review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Agent Briefing Generator
  getAgentBriefing: (customerId: string) =>
    fetchWithRole('/ai/briefing', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),

  // Post-Call Summary Analyzer
  analyzePostCall: (transcript: string) =>
    fetchWithRole('/ai/post-call-summary', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    }),

  // Audit Logs
  getAuditLogs: () => fetchWithRole('/audit-logs'),

  // Global Search
  search: (query: string) => fetchWithRole(`/search?q=${encodeURIComponent(query)}`),
};
