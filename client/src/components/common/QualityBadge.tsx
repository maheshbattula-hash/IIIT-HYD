import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface QualityBadgeProps {
  status?: string;
  score?: number;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ status = 'VALID', score }) => {
  const isHealthy = status === 'VALID' || status === 'HEALTHY' || (score !== undefined && score >= 0.9);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isHealthy
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      {isHealthy ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      ) : (
        <AlertTriangle className="w-3 h-3 text-amber-600" />
      )}
      <span>{status}</span>
      {score !== undefined && (
        <span className="text-slate-500 font-normal">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
};
