import React from 'react';
import { HelpCircle, Sparkles, AlertCircle } from 'lucide-react';

interface DemoQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export const DemoQuestions: React.FC<DemoQuestionsProps> = ({ onSelectQuestion }) => {
  const demoQueries = [
    {
      category: 'Risk & Promises',
      question: 'Which customers are most likely to break a promise to pay?',
      badge: 'NL-to-SQL',
    },
    {
      category: 'Strategy Performance',
      question: 'Which strategies worked best for unsecured loans in the last 90 days?',
      badge: 'Portfolio',
    },
    {
      category: 'Roll-Rates',
      question: 'What were the top drivers of roll-rate deterioration this week?',
      badge: 'Delinquency',
    },
    {
      category: 'Failed Contact',
      question: 'Show me customers with overdue loans and recent failed contact attempts.',
      badge: 'Multi-filter',
    },
    {
      category: 'Collections 360',
      question: 'Summarize customer CUST-10245 collections history.',
      badge: 'Customer 360',
    },
    {
      category: 'Next Best Action',
      question: 'What is the recommended next action for customer CUST-10245?',
      badge: 'Operational AI',
    },
    {
      category: 'Guardrail Test',
      question: 'What will be the weather in Bangalore tomorrow?',
      badge: 'Safety Intercept',
      isGuardrail: true,
    }
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-teal-600" />
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Try Demo Questions (Judge Presets)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {demoQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(item.question)}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.category}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  item.isGuardrail
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                {item.badge}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium group-hover:text-teal-700 transition-colors">
              "{item.question}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
