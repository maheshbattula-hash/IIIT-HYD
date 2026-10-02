import React, { useState } from 'react';
import {
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  Copy,
  Check,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { api } from '../../api';

export const TranscriptStudio: React.FC = () => {
  const sampleTranscripts = [
    {
      title: 'Call 1: Rahul Kumar (Cooperative PTP Arrangement)',
      text: `Agent: Hello, good evening. May I please speak with Mr. Rahul Kumar?
Customer: Yes, this is Rahul speaking. Who is this?
Agent: Good evening Mr. Kumar, I am Pooja calling from CollectIQ on behalf of Apex Bank regarding your Personal Loan account ending in 40291.
Customer: Ah, yes Pooja. I know why you are calling. I am sorry about the delay. My company changed our payroll schedule from the 1st of the month to the 7th starting this quarter.
Agent: Thank you for sharing that Rahul. We noticed your account has two overdue EMIs totaling INR 22,900 and is currently 38 days past due.
Customer: Yes, I can make the full payment of INR 22,900 on Friday, October 9th right after my salary hits my account. Could you please send me a payment link on my WhatsApp?
Agent: Absolutely, Mr. Kumar. I am recording a Promise-to-Pay for INR 22,900 on October 9th. We will send the secure payment link to your registered mobile number on the 8th as a gentle reminder.
Customer: That would be perfect. Thank you so much for your understanding Pooja.
Agent: You're welcome, Mr. Kumar. Have a wonderful evening.`,
    },
    {
      title: 'Call 2: Vikram Patel (Acute Medical Hardship Cited)',
      text: `Agent: Namaste, this is Suresh from Apex Collections. Am I speaking with Mr. Vikram Patel of Patel Textiles?
Customer: Yes Suresh, please... I am at the hospital right now.
Agent: Oh, Mr. Patel, I am sorry to interrupt. We have an urgent notice regarding your Business Loan account which has crossed 100 days overdue.
Customer: Suresh bhai, my wife had an emergency surgery two weeks ago. I have spent over 4 lakhs in medical bills. My factory orders are on hold. I don't have money to eat properly right now, how can I pay 1.2 lakhs EMI? I want to pay my debt, I am not running away, but I need 3 months breathing room!
Agent: Mr. Patel, thank you for being honest with us. Please take care of your wife's health first. Under our Vulnerable Customer Hardship policy, I am placing an immediate 14-day recovery hold on your file and submitting your case to our Hardship Relief committee for loan restructuring.
Customer: God bless you Suresh. I have hospital discharge summaries and medical bills. Where can I send them?
Agent: I am sending you a secure portal link where you can upload the medical documents whenever you are free. No recovery agent will visit your premises during this review.`,
    },
  ];

  const [selectedTranscript, setSelectedTranscript] = useState(sampleTranscripts[0].text);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editableNotes, setEditableNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await api.analyzePostCall(selectedTranscript);
      setAnalysis(res.analysis);
      setEditableNotes(res.analysis.structuredAgentNotes || '');
    } catch (err: any) {
      alert(`Error analyzing transcript: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Post-Call Transcript Intelligence</h2>
            <p className="text-xs text-slate-500">Automated intent extraction, PTP commitment parsing, and hardship tagging</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTranscript(sampleTranscripts[0].text);
                setAnalysis(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Load Rahul Kumar (PTP)
            </button>
            <button
              onClick={() => {
                setSelectedTranscript(sampleTranscripts[1].text);
                setAnalysis(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Load Vikram Patel (Hardship)
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !selectedTranscript.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Extracting Intelligence...' : 'Analyze Transcript'}</span>
            </button>
          </div>
        </div>

        {/* Dual Pane Studio: Original Transcript on Left, Extracted Intelligence on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Original Transcript Input */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Original Call Transcript
            </span>
            <textarea
              rows={16}
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              placeholder="Paste debtor call recording transcript here..."
              className="w-full text-xs font-mono p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>

          {/* Right Column: AI Extraction & Human Edit Panel */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              AI Extracted Intelligence & Structured Output
            </span>

            {!analysis ? (
              <div className="h-[380px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <PhoneCall className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-600 font-medium">No transcript analyzed yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click "Analyze Transcript" above to extract customer intent, PTP date, objections, and hardship flags.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 max-h-[460px] overflow-y-auto">
                {/* Intent & Hardship Banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Intent:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        analysis.customerIntent === 'WILLING_TO_PAY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : analysis.customerIntent === 'HARDSHIP'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {analysis.customerIntent}
                    </span>
                  </div>

                  {analysis.hardshipIndicators && analysis.hardshipIndicators.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Vulnerability Detected
                    </span>
                  )}
                </div>

                {/* AI Executive Summary */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Call Summary
                  </span>
                  <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                {/* Extracted PTP Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase mb-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      Promise-to-Pay Date
                    </div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {analysis.ptpDate || 'No firm date committed'}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase mb-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      Promised Amount
                    </div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {analysis.ptpAmount
                        ? `INR ${analysis.ptpAmount.toLocaleString('en-IN')}`
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Objections & Hardship Signals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.objections && analysis.objections.length > 0 && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Objections Raised:
                      </span>
                      <ul className="space-y-1">
                        {analysis.objections.map((obj: string, i: number) => (
                          <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.hardshipIndicators && analysis.hardshipIndicators.length > 0 && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
                        Hardship Indicators:
                      </span>
                      <ul className="space-y-1">
                        {analysis.hardshipIndicators.map((hs: string, i: number) => (
                          <li key={i} className="text-[11px] text-amber-900 flex items-start gap-1">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{hs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Follow-up Action */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Recommended Follow-up Action
                  </span>
                  <p className="text-xs text-teal-900 bg-teal-50/50 p-2.5 rounded-lg border border-teal-200 font-medium">
                    {analysis.followUpAction}
                  </p>
                </div>

                {/* Structured Agent Notes with Human Edit Option */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Structured Agent Notes (CRM Ready)
                    </span>
                    <button
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingNotes ? 'Done' : 'Human Edit'}</span>
                    </button>
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editableNotes}
                        onChange={(e) => setEditableNotes(e.target.value)}
                        className="w-full text-xs font-mono p-2 bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={handleSaveNotes}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700"
                      >
                        <Save className="w-3 h-3" /> Save to CRM History
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800">
                      {editableNotes || analysis.structuredAgentNotes}
                    </div>
                  )}

                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Note saved to customer collections file.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
