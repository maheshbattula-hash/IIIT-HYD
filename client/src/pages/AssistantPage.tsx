import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Code,
  FileText
} from 'lucide-react';
import { ChatComposer, AttachmentChip } from '../components/assistant/ChatComposer';
import { MessageBubble, ChatMessage } from '../components/assistant/MessageBubble';
import { DemoQuestions } from '../components/assistant/DemoQuestions';
import { api } from '../api';

interface AssistantPageProps {
  onNavigateCustomer: (customerId: string) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ onNavigateCustomer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-studio',
      sender: 'assistant',
      text: `Welcome to the CollectIQ Data Assistant Studio.\n\nI am connected to the unified Collections 360 semantic data layer and run controlled Natural Language-to-SQL and RAG retrieval over credit cards, loans, deposits, and agent notes. Every query generates validated read-only SQL queries with complete data provenance and zero hallucinations.\n\nSelect a preset question below or type your inquiry.`,
      timestamp: new Date().toISOString(),
      dataUsed: ['customers', 'collections_cases', 'loan_accounts'],
      filtersUnderstood: ['Controlled Read-Only SELECT Schema Whitelist'],
      suggestedFollowUps: [
        'Which customers are most likely to break a promise to pay?',
        'What strategies worked best for unsecured loans in the last 90 days?',
        'What were the top drivers of roll-rate deterioration this week?',
        'Summarize customer CUST-10245 collections history.'
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [prefillQuestion, setPrefillQuestion] = useState<string | null>(null);

  const handleSendMessage = async (text: string, attachments: AttachmentChip[]) => {
    if (!text && attachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text || `[Attached: ${attachments.map((a) => a.name).join(', ')}]`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.askAI({
        question: text,
        attachments,
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toISOString(),
        dataUsed: response.dataUsed,
        filtersUnderstood: response.filtersUnderstood,
        sql: response.sql,
        records: response.records,
        rowCount: response.rowCount,
        explanation: response.explanation,
        sources: response.sources,
        suggestedFollowUps: response.suggestedFollowUps,
        isOutsideDomain: response.isOutsideDomain,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Error processing query: ${err.message || 'Server error occurred.'}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Assistant Studio</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              NL-to-SQL + RAG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controlled natural language queries over relational collections tables and agent interaction archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Read-Only AST Validation Active
          </span>
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Demo Questions Presets */}
      <DemoQuestions onSelectQuestion={(q) => handleSendMessage(q, [])} />

      {/* Messages Stream */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 min-h-[440px] space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAskFollowUp={(q) => handleSendMessage(q, [])}
            onNavigateCustomer={onNavigateCustomer}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 w-fit">
            <Bot className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Executing safe read-only SQL & synthesizing response...</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-6 z-20">
        <ChatComposer
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          prefillQuestion={prefillQuestion}
          onClearPrefill={() => setPrefillQuestion(null)}
          placeholder="Ask a collections question (e.g. 'Which customers are most likely to break a promise to pay?')..."
        />
      </div>
    </div>
  );
};
