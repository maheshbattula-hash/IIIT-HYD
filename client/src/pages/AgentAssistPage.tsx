import React, { useEffect, useState } from 'react';
import {
  Headphones,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { BriefingGenerator } from '../components/agentAssist/BriefingGenerator';
import { NBAReviewCard } from '../components/nba/NBAReviewCard';
import { QualityBadge } from '../components/common/QualityBadge';
import { api } from '../api';

interface AgentAssistPageProps {
  onNavigateCustomer: (customerId: string) => void;
}

export const AgentAssistPage: React.FC<AgentAssistPageProps> = ({ onNavigateCustomer }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-10245');
  const [c360Data, setC360Data] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);
      try {
        const res = await api.getCustomer360(selectedCustomerId);
        setC360Data(res);
      } catch (err) {
        console.error('Failed to load agent assist data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [selectedCustomerId]);

  if (loading || !c360Data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-500">Loading Agent Assist Copilot Workspace...</p>
        </div>
      </div>
    );
  }

  const { profile, collectionsTelemetry, interactionIntelligence, nbaRecommendations } = c360Data;
  const latestNBA = nbaRecommendations && nbaRecommendations.length > 0 ? nbaRecommendations[0] : null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agent Assist Workspace</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Live Copilot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time debtor intelligence, one-click conversation briefings, and recommended scripts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500">Active Debtor:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl"
          >
            <option value="CUST-10245">Rahul Kumar (CUST-10245) — 38 DPD</option>
            <option value="CUST-10482">Priya Sharma (CUST-10482) — 72 DPD</option>
            <option value="CUST-10733">Vikram Patel (CUST-10733) — 105 DPD (Hardship)</option>
            <option value="CUST-10901">Anita Desai (CUST-10901) — 18 DPD</option>
            <option value="CUST-11204">Rajesh Verma (CUST-11204) — 45 DPD</option>
          </select>
        </div>
      </div>

      {/* Customer Quick Telemetry Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Debtor</span>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">{profile.name}</div>
          <span className="text-[11px] text-slate-500 font-mono">{profile.customer_id}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Due</span>
          <div className="text-sm font-black text-rose-600 font-mono mt-0.5">
            INR {Number(collectionsTelemetry?.total_outstanding || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">{collectionsTelemetry?.collection_bucket}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">DPD Status</span>
          <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
            {collectionsTelemetry?.days_past_due || 0} Days
          </div>
          <span className="text-[11px] text-slate-500">Tier: {collectionsTelemetry?.risk_tier}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active PTP</span>
          <div className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">
            {collectionsTelemetry?.ptp_date || 'No Date'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {collectionsTelemetry?.ptp_amount ? `INR ${collectionsTelemetry.ptp_amount.toLocaleString('en-IN')}` : 'None'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
          <button
            onClick={() => onNavigateCustomer(profile.customer_id)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            <span>Open 360</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1-Click Briefing Generator */}
      <BriefingGenerator customerId={profile.customer_id} customerName={profile.name} />

      {/* Recommended Next Best Action with HITL Controls */}
      {latestNBA && (
        <NBAReviewCard recommendation={latestNBA} />
      )}

      {/* Recent Interaction History & Agent Notes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Notes & Interactions</h3>
        <div className="space-y-3">
          {interactionIntelligence.agentNotes && interactionIntelligence.agentNotes.length > 0 ? (
            interactionIntelligence.agentNotes.map((note: any) => (
              <div key={note.note_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{note.note_category} • {note.agent_id}</span>
                  <span className="text-[11px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-normal">{note.note_text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No notes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
