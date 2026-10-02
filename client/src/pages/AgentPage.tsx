import React, { useState } from 'react';
import {
  BrainCircuit,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  User,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { AgentStepper } from '../components/agent/AgentStepper';
import { api } from '../api';

interface AgentPageProps {
  onNavigateCustomer: (customerId: string) => void;
}

export const AgentPage: React.FC<AgentPageProps> = ({ onNavigateCustomer }) => {
  const [selectedTask, setSelectedTask] = useState('ANALYZE_CUSTOMER');
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-10245');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<string | null>(null);

  const taskOptions = [
    { id: 'ANALYZE_CUSTOMER', label: 'Analyze Customer Delinquency & Profile', desc: 'Runs multi-product risk analysis on customer account' },
    { id: 'FIND_HIGH_RISK_PTP', label: 'Find High-Risk Broken Promises', desc: 'Identifies accounts likely to default on upcoming PTP commitments' },
    { id: 'SUMMARIZE_CASE', label: 'Summarize Collections Case', desc: 'Synthesizes history, previous treatments, and recovery trajectory' },
    { id: 'RECOMMEND_NEXT_ACTION', label: 'Recommend Next Best Action (NBA)', desc: 'Generates explainable treatment strategy with ethical guardrails' },
    { id: 'PREPARE_AGENT_BRIEFING', label: 'Prepare Agent Pre-Call Briefing', desc: 'Generates structured script and objection handling dossier' },
    { id: 'EXPLAIN_RISK_INDICATORS', label: 'Explain Risk & Vulnerability Signals', desc: 'Deep-dives into early warning and financial distress signals' },
  ];

  const handleRunTask = async () => {
    setIsRunning(true);
    setReviewDecision(null);
    try {
      const res = await api.runAgentTask({
        taskType: selectedTask,
        customerId: selectedCustomerId,
      });
      setExecutionResult(res.execution);
    } catch (err: any) {
      alert(`Error running agent task: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'MODIFIED' | 'REJECTED') => {
    setReviewDecision(decision);
    if (executionResult?.recommendation) {
      try {
        await api.submitNBAReview({
          recommendationId: `REC-${Date.now().toString().slice(-6)}`,
          decision,
          notes: `Decision recorded from AI Agent studio: ${decision}`,
        });
      } catch (err) {
        console.error('Failed to log review:', err);
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Agent Studio</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Autonomous with Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Goal-directed agentic execution pipeline. Investigates data, queries databases, and prepares actions under human supervision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Autonomous Actions Locked</span>
          </span>
        </div>
      </div>

      {/* Task Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Configure Agent Task
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Agent Task:
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {taskOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {taskOptions.find((t) => t.id === selectedTask)?.desc}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Target Customer Account:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="CUST-10245">Rahul Kumar (CUST-10245) — Salaried Prime, 38 DPD (B2)</option>
              <option value="CUST-10482">Priya Sharma (CUST-10482) — Self-Employed, 72 DPD (B3, 2 Broken PTP)</option>
              <option value="CUST-10733">Vikram Patel (CUST-10733) — Micro-SME, 105 DPD (B4, Medical Hardship)</option>
              <option value="CUST-10901">Anita Desai (CUST-10901) — Salaried Prime, 18 DPD (B1, Digital Nudge)</option>
              <option value="CUST-11204">Rajesh Verma (CUST-11204) — Gig Worker, 45 DPD (B2, PTP Promised)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Provides unified Collections 360 context to the autonomous workflow.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunTask}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'Agent Executing...' : 'Execute Agent Task'}</span>
          </button>
        </div>
      </div>

      {/* Review Feedback Toast */}
      {reviewDecision && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Human Review Decision Recorded: {reviewDecision}. Logged to Compliance Audit Trail.
            </span>
          </div>
          <button
            onClick={() => onNavigateCustomer(selectedCustomerId)}
            className="text-xs text-teal-700 underline font-semibold"
          >
            View Customer Collections 360
          </button>
        </div>
      )}

      {/* Live Agent Stepper Execution */}
      {executionResult && (
        <AgentStepper
          steps={executionResult.steps}
          findings={executionResult.findings}
          recommendation={executionResult.recommendation}
          onApprove={() => handleDecision('APPROVED')}
          onModify={() => handleDecision('MODIFIED')}
          onReject={() => handleDecision('REJECTED')}
        />
      )}
    </div>
  );
};
