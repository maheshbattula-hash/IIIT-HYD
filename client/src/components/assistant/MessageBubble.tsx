import React, { useState } from 'react';
import {
  Code,
  FileText,
  HelpCircle,
  Users,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { RetrievedSource } from '../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataUsed?: string[];
  filtersUnderstood?: string[];
  sql?: string;
  records?: any[];
  rowCount?: number;
  explanation?: string;
  sources?: RetrievedSource[];
  suggestedFollowUps?: string[];
  isOutsideDomain?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onAskFollowUp: (question: string) => void;
  onNavigateCustomer: (customerId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAskFollowUp,
  onNavigateCustomer,
}) => {
  const [showSql, setShowSql] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isUser = message.sender === 'user';

  const copySqlToClipboard = () => {
    if (!message.sql) return;
    navigator.clipboard.writeText(message.sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-teal-600 text-white px-4 py-3 shadow-sm text-xs leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[90%] w-full bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-5 shadow-sm text-xs">
        {/* Assistant Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">CollectIQ Assistant</span>
          <span className="text-[10px] text-slate-400 font-medium ml-auto">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Guardrail Warning Banner for Out of Domain Questions */}
        {message.isOutsideDomain && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-950">Domain Boundary Notice</div>
              <p className="mt-0.5 text-[11px] text-amber-800">
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Main Answer Text */}
        {!message.isOutsideDomain && (
          <div className="text-slate-800 leading-relaxed font-normal whitespace-pre-line mb-4">
            {message.text}
          </div>
        )}

        {/* Metadata Tags: Data Used & Filters Understood */}
        {((message.dataUsed && message.dataUsed.length > 0) || (message.filtersUnderstood && message.filtersUnderstood.length > 0)) && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            {message.dataUsed && message.dataUsed.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Used:</span>
                {message.dataUsed.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-white text-slate-700 border border-slate-200"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            {message.filtersUnderstood && message.filtersUnderstood.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
                {message.filtersUnderstood.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-teal-50 text-teal-800 border border-teal-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {message.sql && (
            <button
              onClick={() => setShowSql(!showSql)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showSql
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>[View SQL]</span>
              {showSql ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showSources
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>[View Sources] ({message.sources.length})</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {message.explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showExplanation
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>[Explain]</span>
              {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {message.records && message.records.length > 0 && (
            <button
              onClick={() => setShowCustomers(!showCustomers)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showCustomers
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>[View Customers] ({message.records.length})</span>
              {showCustomers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Expandable SQL Viewer Drawer */}
        {showSql && message.sql && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] relative">
            <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <span>VALIDATED READ-ONLY SQL QUERY</span>
              <button
                onClick={copySqlToClipboard}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap">{message.sql}</pre>
          </div>
        )}

        {/* Expandable Sources Drawer */}
        {showSources && message.sources && message.sources.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Retrieved Unstructured Documents & Citations
            </div>
            {message.sources.map((src, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-teal-700">{src.sourceType} • {src.id}</span>
                  <span className="text-slate-400">{src.authorOrAgent} • {src.dateOrTimestamp}</span>
                </div>
                <p className="text-slate-700 text-xs italic">"{src.snippet}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Expandable Explanation Drawer */}
        {showExplanation && message.explanation && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950">
            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
              AI Decisioning & Derivation Rationale
            </div>
            <p className="text-xs leading-relaxed text-indigo-900">{message.explanation}</p>
          </div>
        )}

        {/* Expandable Customers Data Table */}
        {showCustomers && message.records && message.records.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
              Relevant Customer & Delinquency Records
            </div>
            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    {Object.keys(message.records[0]).map((key) => (
                      <th key={key} className="px-3 py-2 whitespace-nowrap">{key}</th>
                    ))}
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {message.records.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      {Object.entries(row).map(([k, v], cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 whitespace-nowrap text-slate-700 font-mono">
                          {typeof v === 'number' && k.includes('outstanding')
                            ? `INR ${v.toLocaleString('en-IN')}`
                            : String(v ?? '-')}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {row.customer_id && (
                          <button
                            onClick={() => onNavigateCustomer(row.customer_id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-800"
                          >
                            View 360 <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suggested Follow-up Questions */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Suggested Follow-up Questions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowUps.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onAskFollowUp(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-[11px] text-slate-700 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
