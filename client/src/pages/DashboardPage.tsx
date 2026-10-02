import React, { useEffect, useState } from 'react';
import {
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PhoneCall,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Bot,
  BrainCircuit,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { api } from '../api';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
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
          <p className="text-xs font-medium text-slate-500">Loading Collections Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;
  const bucketColors = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Executive Collections Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Unified telemetry across credit cards, loans, deposit liquidity, and omnichannel recoveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/collections-360')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Collections 360</span>
          </button>
          <button
            onClick={() => onNavigate('/assistant')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Assistant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={kpis.totalCustomers}
          subtitle="Unified Golden Profiles"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Active Delinquency Cases"
          value={kpis.activeCollectionsCases}
          subtitle="Buckets B1 to B4"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Total Exposure Due"
          value={`INR ${(kpis.totalOutstandingAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`Avg DPD: ${kpis.avgDpd} days`}
          icon={DollarSign}
          color="rose"
        />
        <StatCard
          title="PTP Honored Rate"
          value={kpis.ptpRate}
          subtitle={`Broken Rate: ${kpis.brokenPromiseRate}`}
          icon={TrendingUp}
          trend="+4.2% MoM"
          trendPositive={true}
          color="emerald"
        />
      </div>

      {/* Operational AI Alert Banner */}
      {kpis.pendingHumanReviews > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block">
                Operational AI Insights
              </span>
              <p className="text-xs text-indigo-800">
                Next Best Action engine generated recommendations for {kpis.pendingHumanReviews} delinquent accounts requiring human agent review.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/collections-360')}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <span>Review Actions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Section: Bucket Delinquency + PTP Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delinquency by Bucket */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Exposure by Bucket</h3>
              <p className="text-xs text-slate-500">Total debt outstanding across delinquency stages</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              B0 to B4
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bucketDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any) => [`INR ${Number(value).toLocaleString('en-IN')}`, 'Exposure']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="total_amount" radius={[6, 6, 0, 0]}>
                  {data.bucketDistribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={bucketColors[index % bucketColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Promise-to-Pay Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Promise-to-Pay (PTP) Trend</h3>
              <p className="text-xs text-slate-500">Weekly commitment fulfillment vs broken promises</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              86.6% Fulfillment
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.ptpWeeklyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="promisesMade" name="Promises Made" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="promisesHonored" name="Honored" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="broken" name="Broken" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Roll-Rate Matrix & Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roll-Rate Transition Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Roll-Rate Transition Matrix</h3>
              <p className="text-xs text-slate-500">30-day delinquency migration rates across buckets</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Industry Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Delinquency Bucket</th>
                  <th className="py-2.5 px-3 text-emerald-700">Cured to Current</th>
                  <th className="py-2.5 px-3 text-amber-700">Roll to Next Bucket</th>
                  <th className="py-2.5 px-3 text-rose-700">Write-off / NPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data.rollRateMatrix.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{row.fromBucket}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{row.toCurrent}</td>
                    <td className="py-2.5 px-3 text-amber-700 font-medium">{row.toB1 || row.toB2 || row.toB3 || row.toB4 || row.toNPL}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-medium">{row.writeOff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Quality & Observability Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Data Product Quality</h3>
                <p className="text-xs text-slate-500">Automated Data Contract SLA</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {data.dataQualityIndex?.overallScore}% Score
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Completeness', val: data.dataQualityIndex?.completeness },
                { label: 'Uniqueness', val: data.dataQualityIndex?.uniqueness },
                { label: 'Validity', val: data.dataQualityIndex?.validity },
                { label: 'Consistency', val: data.dataQualityIndex?.consistency },
                { label: 'Freshness', val: data.dataQualityIndex?.freshness },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="text-slate-900 font-bold font-mono">{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${item.val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('/data-quality')}
            className="w-full mt-6 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Data Quality Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
