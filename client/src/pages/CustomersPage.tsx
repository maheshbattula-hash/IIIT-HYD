import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { QualityBadge } from '../components/common/QualityBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface CustomersPageProps {
  onSelectCustomer: (customerId: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onSelectCustomer }) => {
  const { role } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [bucketFilter, setBucketFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await api.getCustomers();
        setCustomers(res.customers || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [role]);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.customer_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.primary_phone.includes(searchFilter);

    const matchesBucket =
      bucketFilter === 'ALL' || (c.collection_bucket && c.collection_bucket.includes(bucketFilter));

    const matchesRisk =
      riskFilter === 'ALL' || c.risk_tier === riskFilter;

    return matchesSearch && matchesBucket && matchesRisk;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master directory of deduplicated collections customer accounts with delinquency telemetry.
          </p>
        </div>

        {role === 'ANALYST' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Role: Risk Analyst (PII Masking Active)</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by customer name, CUST ID, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={bucketFilter}
            onChange={(e) => setBucketFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Buckets</option>
            <option value="B0">B0 (Current)</option>
            <option value="B1">B1 (1-30 DPD)</option>
            <option value="B2">B2 (31-60 DPD)</option>
            <option value="B3">B3 (61-90 DPD)</option>
            <option value="B4">B4 (90+ DPD)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Outstanding Due</th>
                  <th className="py-3 px-4">DPD</th>
                  <th className="py-3 px-4">Bucket</th>
                  <th className="py-3 px-4">PTP Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.customer_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{cust.name}</span>
                        {cust.hardship_flag === 1 && (
                          <span title="Hardship Flagged">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cust.customer_id}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{cust.customer_segment}</td>
                    <td className="py-3 px-4 text-slate-700">{cust.primary_phone}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      INR {Number(cust.total_outstanding || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${cust.days_past_due > 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {cust.days_past_due || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {cust.collection_bucket || 'B0'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <QualityBadge status={cust.ptp_status || 'NO_PTP'} />
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectCustomer(cust.customer_id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors"
                      >
                        <span>View 360</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
