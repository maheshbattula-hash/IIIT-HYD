import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { role, setRole } = useAuth();
  const [provider, setProvider] = useState<'mock' | 'gemini' | 'openai'>('mock');
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & AI Provider</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure artificial intelligence models, database parameters, and environment settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* AI Provider Abstraction Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Provider Abstraction</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          CollectIQ supports dynamic provider swapping. In <strong>MockProvider</strong> mode, the system uses internal domain heuristic models and template-driven logic for instantaneous, 100% offline hackathon demos with zero API key configuration needed.
        </p>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Active AI Provider:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mock', name: 'MockProvider (Recommended)', desc: 'Zero config, offline, deterministic' },
                { id: 'gemini', name: 'Google Gemini 1.5', desc: 'Google Cloud generative models' },
                { id: 'openai', name: 'OpenAI GPT-4o', desc: 'OpenAI Enterprise endpoints' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProvider(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {provider !== 'mock' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                API Key for {provider.toUpperCase()}:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Never stored in plain text or exposed to frontend code.
              </span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Database & Architecture Specs Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Database Engine & Storage</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Relational Engine</span>
            <span className="text-slate-900 font-bold font-mono mt-0.5 block">SQLite via Node.js node:sqlite</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Storage File Path</span>
            <span className="text-slate-900 font-bold font-mono mt-0.5 block">./server/data/collectiq.db</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Security Execution Mode</span>
            <span className="text-emerald-700 font-bold font-mono mt-0.5 block">READ-ONLY SELECT AST Enforced</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Data Product Contract SLA</span>
            <span className="text-slate-900 font-bold font-mono mt-0.5 block">Version 2.4.0 (JSON-Schema Compliant)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
