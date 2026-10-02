import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PhoneCall,
  DollarSign,
  AlertTriangle,
  Users,
  ShieldCheck
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { api } from '../api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-500">Loading Deep Analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const productDistribution = [
    { name: 'Unsecured Personal Loans', value: 48 },
    { name: 'Credit Cards', value: 28 },
    { name: 'Auto Loans', value: 16 },
    { name: 'Two-Wheeler Loans', value: 8 },
  ];

  const channelPerformance = [
    { channel: 'Telephony (Outbound)', attempts: 240, responseRate: '72%', promisesCaptured: 64 },
    { channel: 'WhatsApp Interactive', attempts: 380, responseRate: '84%', promisesCaptured: 82 },
    { channel: 'SMS Nudge', attempts: 520, responseRate: '41%', promisesCaptured: 28 },
    { channel: 'Email Digest', attempts: 180, responseRate: '32%', promisesCaptured: 14 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Analytics & Intelligence</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Aggregated Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Delinquency migration, channel ROI, promise-to-pay curves, and multi-product concentration.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outstanding Debt"
          value={`INR ${Number(data.kpis.totalOutstandingAmount).toLocaleString('en-IN')}`}
          subtitle={`Avg DPD: ${data.kpis.avgDpd} days`}
          icon={DollarSign}
          color="rose"
        />
        <StatCard
          title="Promise-to-Pay (PTP) Rate"
          value={data.kpis.ptpRate}
          subtitle={`Broken Rate: ${data.kpis.brokenPromiseRate}`}
          icon={TrendingUp}
          trend="+5.1% vs Benchmark"
          trendPositive={true}
          color="emerald"
        />
        <StatCard
          title="Contact Success Rate"
          value={data.kpis.contactSuccessRate}
          subtitle="Connected or Delivered"
          icon={PhoneCall}
          color="teal"
        />
        <StatCard
          title="Hardship & Vulnerable Accounts"
          value={data.kpis.hardshipCases}
          subtitle="Ethical Protection Active"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Main Charts: Delinquency Buckets & Product Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delinquency Buckets Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delinquency Exposure by Bucket</h3>
              <p className="text-xs text-slate-500">Distribution of delinquent balances across B0-B4</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              INR {Number(data.kpis.totalOutstandingAmount).toLocaleString('en-IN')} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bucketDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`INR ${Number(val).toLocaleString('en-IN')}`, 'Outstanding']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="total_amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Concentration Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Product Concentration</h3>
            <p className="text-xs text-slate-500">Share of delinquent volume by product</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {productDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {productDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Omnichannel Recovery Performance</h3>
        <p className="text-xs text-slate-500 mb-4">Channel response velocity and commitment generation</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Outreach Channel</th>
                <th className="p-3">Total Attempts</th>
                <th className="p-3">Response Rate</th>
                <th className="p-3">Promises Captured</th>
                <th className="p-3">Effectiveness Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {channelPerformance.map((ch, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-sans font-bold text-slate-900">{ch.channel}</td>
                  <td className="p-3">{ch.attempts}</td>
                  <td className="p-3 font-bold text-emerald-700">{ch.responseRate}</td>
                  <td className="p-3">{ch.promisesCaptured} commitments</td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Tier {idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
