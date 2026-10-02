import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AgentStep } from '../../types';

interface AgentExecutionProps {
  steps: AgentStep[];
  findings?: string;
  recommendation?: {
    action: string;
    rationale: string;
    evidence: string[];
    confidence: number;
    requiresHumanReview: boolean;
  };
  onApprove: () => void;
  onModify: () => void;
  onReject: () => void;
}

export const AgentStepper: React.FC<AgentExecutionProps> = ({
  steps,
  findings,
  recommendation,
  onApprove,
  onModify,
  onReject,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Agent Execution Pipeline</h3>
            <p className="text-xs text-slate-500">Autonomous workflow with deterministic guardrails</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Human review required
        </span>
      </div>

      {/* Stepper Pipeline */}
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isPending = step.status === 'PENDING';
          const isRunning = step.status === 'RUNNING';

          return (
            <div key={step.id || idx} className="relative flex items-start gap-4 pl-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isRunning
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isRunning ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{step.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isRunning
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>

                {step.dataSnippet && (
                  <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                    <pre className="overflow-x-auto">{JSON.stringify(step.dataSnippet, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Autonomous Findings Summary */}
      {findings && (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Autonomous Analysis Findings
          </span>
          <p className="text-xs text-slate-800 leading-relaxed">{findings}</p>
        </div>
      )}

      {/* Final Recommendation & Human Review Gate */}
      {recommendation && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-teal-50/40 border-2 border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
              Agent Recommendation
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {(recommendation.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="text-base font-extrabold text-slate-900 mb-2">
            {recommendation.action}
          </div>

          <p className="text-xs text-slate-700 mb-3 leading-relaxed">
            {recommendation.rationale}
          </p>

          {recommendation.evidence && recommendation.evidence.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Supporting Evidence:
              </span>
              <ul className="space-y-1">
                {recommendation.evidence.map((ev, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Human Review Control Banner */}
          <div className="pt-4 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Human approval required before execution</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onReject}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onModify}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Modify
              </button>
              <button
                onClick={onApprove}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
              >
                Approve & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
