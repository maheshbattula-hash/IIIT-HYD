import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Bot
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { ChatComposer, AttachmentChip } from '../assistant/ChatComposer';
import { MessageBubble, ChatMessage } from '../assistant/MessageBubble';
import { DemoQuestions } from '../assistant/DemoQuestions';
import { api } from '../../api';

interface FloatingAssistantProps {
  onNavigateCustomer: (customerId: string) => void;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onNavigateCustomer }) => {
  const { isOpen, toggleOpen, setIsOpen, activeCustomerId, pendingQuestion, setPendingQuestion } = useAssistant();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am your CollectIQ Collections Data Assistant. You can ask me questions about delinquent portfolios, promise-to-pay adherence, roll-rate migration, or specific customer collections 360 files. Try one of the preset questions below or type your inquiry.',
      timestamp: new Date().toISOString(),
      suggestedFollowUps: [
        'Which customers are most likely to break a promise to pay?',
        'What strategies worked best for unsecured loans in the last 90 days?',
        'Summarize customer CUST-10245.'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = async (text: string, attachments: AttachmentChip[]) => {
    if (!text && attachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text || `[Attached: ${attachments.map(a => a.name).join(', ')}]`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.askAI({
        question: text,
        attachments,
        customerId: activeCustomerId || undefined,
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
          text: `Error processing query: ${err.message || 'Unable to connect to CollectIQ engine.'}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all border border-slate-700 active:scale-95 group"
      >
        <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <span className="text-xs font-bold tracking-tight">AI Assistant</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed right-6 z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all overflow-hidden ${
        isMinimized
          ? 'bottom-6 w-80 h-14'
          : 'bottom-6 w-[480px] h-[640px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-5rem)]'
      }`}
    >
      {/* Header */}
      <div className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight">CollectIQ Assistant</div>
            <div className="text-[10px] text-teal-400 font-medium">Controlled NL-to-SQL + RAG</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            title="Reset Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Messages & Demo Questions */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.length === 1 && (
              <DemoQuestions onSelectQuestion={(q) => handleSendMessage(q, [])} />
            )}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onAskFollowUp={(q) => handleSendMessage(q, [])}
                onNavigateCustomer={(cId) => {
                  setIsOpen(false);
                  onNavigateCustomer(cId);
                }}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 w-fit">
                <Bot className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Running controlled NL-to-SQL & retrieving records...</span>
              </div>
            )}
          </div>

          {/* Footer Composer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <ChatComposer
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              prefillQuestion={pendingQuestion}
              onClearPrefill={() => setPendingQuestion(null)}
              placeholder="Ask collections question..."
            />
          </div>
        </>
      )}
    </div>
  );
};
