import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Headphones,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { api } from '../../api';

interface BriefingGeneratorProps {
  customerId: string;
  customerName?: string;
}

export const BriefingGenerator: React.FC<BriefingGeneratorProps> = ({
  customerId,
  customerName = 'Rahul Kumar',
}) => {
  const [briefing, setBriefing] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAgentBriefing(customerId);
      setBriefing(res.briefing);
    } catch (err: any) {
      alert(`Error generating briefing: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBriefing = () => {
    if (!briefing) return;
    const text = `CUSTOMER BRIEFING — ${customerName} (${customerId})
========================================
Situation:
${briefing.situation}

Recent Interaction:
${briefing.recentInteraction}

Important Context:
${briefing.importantContext}

Suggested Conversation Focus:
${briefing.suggestedConversationFocus}

Objection Handling Tips:
${(briefing.objectionHandlingTips || []).map((t: string) => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Agent Briefing Copilot</h3>
            <p className="text-xs text-slate-500">Real-time debtor intelligence & conversation focus</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Synthesizing...' : 'Generate Agent Briefing'}</span>
        </button>
      </div>

      {!briefing ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">
            Click "Generate Agent Briefing" to create an AI pre-call dossier for {customerName}.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Synthesizes loan history, payment promises, agent notes, and objection handling tips.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Debtor Call Briefing
            </span>
            <button
              onClick={copyBriefing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy briefing'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Situation:
              </span>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{briefing.situation}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                Recent Interaction:
              </span>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{briefing.recentInteraction}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Important Context:
              </span>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{briefing.importantContext}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Suggested Conversation Focus:
              </span>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed font-semibold">
                {briefing.suggestedConversationFocus}
              </p>
            </div>

            {briefing.objectionHandlingTips && briefing.objectionHandlingTips.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Objection Handling & Negotiation Tips:
                </span>
                <ul className="space-y-1">
                  {briefing.objectionHandlingTips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
