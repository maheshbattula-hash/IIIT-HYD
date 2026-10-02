import React, { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Briefcase,
  PiggyBank,
  PhoneCall,
  Clock,
  Sparkles,
  Bot,
  CheckCircle2,
  FileText,
  TrendingDown,
  Building,
  ChevronDown
} from 'lucide-react';
import { LineageBadge } from '../components/common/LineageBadge';
import { QualityBadge } from '../components/common/QualityBadge';
import { NBAReviewCard } from '../components/nba/NBAReviewCard';
import { BriefingGenerator } from '../components/agentAssist/BriefingGenerator';
import { useAssistant } from '../context/AssistantContext';
import { api } from '../api';

interface Collections360PageProps {
  initialCustomerId?: string;
  onNavigate: (path: string) => void;
}

export const Collections360Page: React.FC<Collections360PageProps> = ({
  initialCustomerId = 'CUST-10245',
  onNavigate,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [c360Data, setC360Data] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FINANCIALS' | 'INTERACTIONS' | 'LINEAGE'>('OVERVIEW');

  const { askAssistant } = useAssistant();

  // Load customer roster for dropdown
  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await api.getCustomers();
        setCustomerList(res.customers || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    }
    loadCustomers();
  }, []);

  // Load complete 360 profile whenever selected customer changes
  useEffect(() => {
    async function load360() {
      setLoading(true);
      try {
        const res = await api.getCustomer360(selectedCustomerId);
        setC360Data(res);
      } catch (err) {
        console.error('Failed to load Collections 360:', err);
      } finally {
        setLoading(false);
      }
    }
    load360();
  }, [selectedCustomerId]);

  if (loading || !c360Data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-500">Loading Collections 360 Dossier...</p>
        </div>
      </div>
    );
  }

  const { profile, financialRelationships, collectionsTelemetry, interactionIntelligence, nbaRecommendations, lineageAndQuality } = c360Data;

  const latestNBA = nbaRecommendations && nbaRecommendations.length > 0 ? nbaRecommendations[0] : null;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Customer Switcher & Quick AI Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Customer:
          </label>
          <div className="relative">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {customerList.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} ({c.customer_id}) • {c.collection_bucket || 'B0'} • DPD: {c.days_past_due || 0}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => askAssistant(`Summarize customer ${profile.customer_id} collections history.`, profile.customer_id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Ask AI About {profile.name.split(' ')[0]}</span>
          </button>
          <button
            onClick={() => onNavigate('/post-call')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-slate-500" />
            <span>Post-Call Summary</span>
          </button>
        </div>
      </div>

      {/* Customer Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Identity & Demographics */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              {profile.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {profile.customer_id}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {profile.customer_segment}
                </span>
                {profile.hardship_flag === 1 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600" /> Hardship Flagged
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile.primary_phone}
                </span>
                {profile.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
                  </span>
                )}
                {profile.pan_number && (
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> PAN: {profile.pan_number}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.city}, {profile.state}
                </span>
              </div>

              {/* Lineage & Quality Provenance Row */}
              <div className="pt-2">
                <LineageBadge
                  source={lineageAndQuality.sourceSystem}
                  refreshedAt={lineageAndQuality.lastRefreshedAt}
                  confidence={lineageAndQuality.matchConfidence}
                />
              </div>
            </div>
          </div>

          {/* Delinquency Highlights Box */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex-shrink-0">
            <div className="text-right pr-3 border-r border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Overdue
              </span>
              <div className="text-lg font-black text-rose-600 font-mono">
                INR {Number(collectionsTelemetry?.total_outstanding || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-right pr-3 border-r border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Days Past Due
              </span>
              <div className="text-base font-extrabold text-slate-900 font-mono">
                {collectionsTelemetry?.days_past_due || 0} DPD
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Delinquency Bucket
              </span>
              <span className="inline-block mt-0.5 text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
                {collectionsTelemetry?.collection_bucket || 'B0 (Current)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardship Alert Box if applicable */}
      {profile.hardship_flag === 1 && profile.hardship_reason && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block">
              Documented Financial Hardship
            </span>
            <p className="text-xs text-rose-900 mt-0.5 leading-relaxed">
              {profile.hardship_reason}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'Collections Dossier' },
          { id: 'FINANCIALS', label: 'Financial Portfolio (Cards & Loans)' },
          { id: 'INTERACTIONS', label: 'Interaction Timeline' },
          { id: 'LINEAGE', label: 'Data Lineage & Deduplication' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Telemetry & Behavior Indicators */}
          <div className="lg:col-span-2 space-y-6">
            {/* Telemetry Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Collections Telemetry & Commitments
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">PTP Status</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                    {collectionsTelemetry?.ptp_status || 'NO_PTP'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">PTP Reliability</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono mt-0.5 block">
                    {((collectionsTelemetry?.ptp_reliability_score || 0) * 100).toFixed(0)}% Score
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Broken Promises</span>
                  <span className="text-xs font-bold text-rose-600 font-mono mt-0.5 block">
                    {collectionsTelemetry?.broken_ptp_count || 0} times
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Credit Bureau</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                    {profile.credit_bureau_score || 'N/A'}
                  </span>
                </div>
              </div>

              {collectionsTelemetry?.ptp_date && (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                      Active Promise Commitment
                    </span>
                    <span className="text-xs font-bold text-teal-950 font-mono">
                      INR {Number(collectionsTelemetry.ptp_amount || 0).toLocaleString('en-IN')} due on {collectionsTelemetry.ptp_date}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
                    Cooperative
                  </span>
                </div>
              )}
            </div>

            {/* Explainable Next Best Action */}
            {latestNBA && (
              <NBAReviewCard recommendation={latestNBA} />
            )}

            {/* Agent Copilot Briefing Generator */}
            <BriefingGenerator customerId={profile.customer_id} customerName={profile.name} />
          </div>

          {/* Right Column: Key Details & Risk Signals */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Omnichannel Preferences
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Preferred Channel:</span>
                  <span className="font-bold text-slate-900 font-mono">{profile.preferred_channel}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Best Contact Window:</span>
                  <span className="font-bold text-slate-900 font-mono">{profile.best_time_to_contact}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Consent Status:</span>
                  <span className="font-bold text-emerald-700">{profile.consent_status}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Assigned Agent:</span>
                  <span className="font-bold text-slate-900">{collectionsTelemetry?.assigned_agent_id || 'Digital Queue'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Assigned Strategy:</span>
                  <span className="font-bold text-indigo-700">{collectionsTelemetry?.assigned_strategy}</span>
                </div>
              </div>
            </div>

            {/* Recent Agent Notes Snippet */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Recent Interaction Note
              </h3>
              {interactionIntelligence.agentNotes && interactionIntelligence.agentNotes.length > 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700">{interactionIntelligence.agentNotes[0].agent_id}</span>
                    <span>{new Date(interactionIntelligence.agentNotes[0].timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    {interactionIntelligence.agentNotes[0].note_text}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FINANCIAL RELATIONSHIPS */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-6">
          {/* Exposure Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Card Debt</span>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">
                INR {financialRelationships.totalCardDebt.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Loan Debt</span>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">
                INR {financialRelationships.totalLoanDebt.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Deposit Liquidity</span>
              <div className="text-lg font-black text-emerald-700 font-mono mt-1">
                INR {financialRelationships.totalLiquidDeposits.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Bank Exposure</span>
              <div className="text-lg font-black text-rose-600 font-mono mt-1">
                INR {(financialRelationships.totalCardDebt + financialRelationships.totalLoanDebt - financialRelationships.totalLiquidDeposits).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Loan Accounts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Loan Accounts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Loan ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Principal Due</th>
                    <th className="p-3">Monthly EMI</th>
                    <th className="p-3">Overdue</th>
                    <th className="p-3">DPD</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {financialRelationships.loans.map((l: any) => (
                    <tr key={l.loan_account_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{l.loan_account_id}</td>
                      <td className="p-3 font-sans font-medium">{l.loan_type} ({l.is_secured ? 'Secured' : 'Unsecured'})</td>
                      <td className="p-3">INR {l.outstanding_principal.toLocaleString('en-IN')}</td>
                      <td className="p-3">INR {l.emi_amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-rose-600 font-bold">INR {l.overdue_amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-bold">{l.dpd}</td>
                      <td className="p-3"><QualityBadge status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit Card Accounts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Credit Card Accounts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Card ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Card Number</th>
                    <th className="p-3">Credit Limit</th>
                    <th className="p-3">Current Balance</th>
                    <th className="p-3">Min Due</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {financialRelationships.cards.map((c: any) => (
                    <tr key={c.card_account_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.card_account_id}</td>
                      <td className="p-3 font-sans font-medium">{c.card_type}</td>
                      <td className="p-3">{c.card_number_masked}</td>
                      <td className="p-3">INR {c.credit_limit.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-bold text-rose-600">INR {c.current_balance.toLocaleString('en-IN')}</td>
                      <td className="p-3">INR {c.minimum_amount_due.toLocaleString('en-IN')}</td>
                      <td className="p-3">{c.payment_due_date}</td>
                      <td className="p-3"><QualityBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deposit Liquidity Accounts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Deposit & Current Accounts (Internal Liquidity)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Account ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Account Number</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Avg Quarterly Balance</th>
                    <th className="p-3">Salary Account</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {financialRelationships.deposits.map((d: any) => (
                    <tr key={d.deposit_account_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{d.deposit_account_id}</td>
                      <td className="p-3 font-sans font-medium">{d.account_type}</td>
                      <td className="p-3">{d.account_number_masked}</td>
                      <td className="p-3 font-bold text-emerald-700">INR {d.current_balance.toLocaleString('en-IN')}</td>
                      <td className="p-3">INR {d.avg_quarterly_balance.toLocaleString('en-IN')}</td>
                      <td className="p-3">{d.is_salary_account ? 'Yes (Verified Salary)' : 'No'}</td>
                      <td className="p-3"><QualityBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: INTERACTIONS */}
      {activeTab === 'INTERACTIONS' && (
        <div className="space-y-6">
          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Agent Notes & Field Observations</h3>
            <div className="space-y-3">
              {interactionIntelligence.agentNotes.map((note: any) => (
                <div key={note.note_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{note.note_category} • {note.agent_id}</span>
                    <span className="text-slate-400 text-[11px]">{new Date(note.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-normal">{note.note_text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Omnichannel Contact Logs</h3>
            <div className="divide-y divide-slate-100">
              {interactionIntelligence.contactHistory.map((c: any) => (
                <div key={c.interaction_id} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.channel} ({c.direction})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.outcome}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{c.response_payload}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(c.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: LINEAGE & DATA PRODUCT DEDUPLICATION */}
      {activeTab === 'LINEAGE' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Data Product Factory Lineage</h3>
            <p className="text-xs text-slate-500 mb-6">
              Full traceability showing how messy source feeds from Bronze staging were cleansed, deduplicated, and resolved into this Golden record.
            </p>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Raw Feeds Ingested & Resolved
              </span>

              {lineageAndQuality.rawStagingSources && lineageAndQuality.rawStagingSources.length > 0 ? (
                <div className="space-y-3">
                  {lineageAndQuality.rawStagingSources.map((raw: any) => (
                    <div key={raw.raw_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-teal-800">{raw.raw_id}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                            Source: {raw.source_feed}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {(raw.match_confidence * 100).toFixed(1)}% Match Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mb-2">
                        <div><span className="text-slate-400">Raw Name:</span> {raw.extracted_name}</div>
                        <div><span className="text-slate-400">Raw Phone:</span> {raw.extracted_phone}</div>
                        <div><span className="text-slate-400">Raw Email:</span> {raw.extracted_email || 'null'}</div>
                        <div><span className="text-slate-400">Raw PAN:</span> {raw.extracted_pan || 'null'}</div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 font-sans">
                        <span className="font-bold text-slate-700">Deduplication Rule: </span>
                        {raw.match_reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No raw staging records linked.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
