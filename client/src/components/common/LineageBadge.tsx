import React from 'react';
import { Database, ShieldCheck, Clock } from 'lucide-react';

interface LineageBadgeProps {
  source?: string;
  refreshedAt?: string;
  confidence?: number;
  compact?: boolean;
}

export const LineageBadge: React.FC<LineageBadgeProps> = ({
  source = 'CRM_MASTER',
  refreshedAt,
  confidence,
  compact = false,
}) => {
  const formattedDate = refreshedAt
    ? new Date(refreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Database className="w-3 h-3 text-teal-600" />
        <span className="truncate max-w-[120px]">{source}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1 font-medium text-slate-800">
        <Database className="w-3.5 h-3.5 text-teal-600" />
        {source}
      </span>
      {confidence !== undefined && (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          {(confidence * 100).toFixed(0)}% match
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Clock className="w-3 h-3 text-slate-400" />
        {formattedDate}
      </span>
    </div>
  );
};
