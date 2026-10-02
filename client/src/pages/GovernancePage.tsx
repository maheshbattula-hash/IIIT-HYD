import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  Clock,
  Database,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const GovernancePage: React.FC = () => {
  const { role, setRole } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.getAuditLogs();
        setAuditLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [role]);

  const filteredLogs = auditLogs.filter((log) => {
    return filterAction === 'ALL' || log.action_type.includes(filterAction);
  });

  const rbacMatrix = [
    { permission: 'Executive Dashboard & Roll-rates', admin: 'Full Access', manager: 'Full Access', agent: 'Read-Only (Own)', analyst: 'Full (Aggregated)' },
    { permission: 'Collections 360 Customer Profile', admin: 'Full Access', manager: 'Full Access', agent: 'Assigned Accounts', analyst: 'Masked PII Only' },
    { permission: 'Next Best Action - Decision Override', admin: 'Approve / Reject', manager: 'Approve / Modify', agent: 'Execute Assigned', analyst: 'No Action (Read)' },
    { permission: 'AI Assistant (Controlled NL-to-SQL)', admin: 'Full Access', manager: 'Full Access', agent: 'Full Access', analyst: 'Full Access' },
    { permission: 'Data Product Contracts & SLA Admin', admin: 'Full Edit', manager: 'Read-Only', agent: 'No Access', analyst: 'Read-Only' },
    { permission: 'System Compliance Audit Logs', admin: 'Full System Logs', manager: 'Team Logs', agent: 'Self Activity Only', analyst: 'Audit Metrics' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Governance, RBAC & Auditability</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              SOC-2 & Basel Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforcing role-based access control, cryptographic audit logging, model explainability, and permitted data usage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Active Role: <span className="text-teal-700 font-extrabold">{role}</span>
          </span>
        </div>
      </div>

      {/* RBAC Matrix Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Role-Based Access Control (RBAC) Entitlements</h3>
        <p className="text-xs text-slate-500 mb-4">
          Strict separation of duties. Data masking is dynamically applied based on the authenticated role.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Functional Capability</th>
                <th className="p-3">ADMIN</th>
                <th className="p-3">COLLECTIONS_MANAGER</th>
                <th className="p-3">COLLECTIONS_AGENT</th>
                <th className="p-3">ANALYST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rbacMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{item.permission}</td>
                  <td className="p-3 text-slate-700 font-mono text-[11px]">{item.admin}</td>
                  <td className="p-3 text-slate-700 font-mono text-[11px]">{item.manager}</td>
                  <td className="p-3 text-slate-700 font-mono text-[11px]">{item.agent}</td>
                  <td className="p-3 text-indigo-700 font-mono text-[11px]">{item.analyst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immutable Audit Ledger</h3>
            <p className="text-xs text-slate-500">
              Every AI query, generated SQL, Next Best Action decision, and human review is permanently stamped.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">All Event Types</option>
              <option value="NL_">Natural Language Queries</option>
              <option value="NBA_">Human Review Decisions</option>
              <option value="DATA_PRODUCT">Data Engineering Runs</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading audit ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Details / Generated Query</th>
                  <th className="p-3">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{log.log_id}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-800">{log.user_id}</div>
                      <span className="text-[10px] text-teal-600">{log.user_role}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-700 font-sans" title={log.query_text}>
                      {log.query_text || log.response_summary}
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.decision === 'APPROVED' || log.decision === 'EXECUTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.decision || 'LOGGED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
