import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { NBARecommendation } from '../../types';
import { api } from '../../api';

interface NBAReviewCardProps {
  recommendation: NBARecommendation;
  onReviewCompleted?: () => void;
}

export const NBAReviewCard: React.FC<NBAReviewCardProps> = ({
  recommendation,
  onReviewCompleted,
}) => {
  const [reviewStatus, setReviewStatus] = useState<'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED'>(
    recommendation.review_status || 'PENDING'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(recommendation.recommended_action);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDecision = async (decision: 'APPROVED' | 'MODIFIED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      await api.submitNBAReview({
        recommendationId: recommendation.recommendation_id,
        decision,
        modifiedAction: decision === 'MODIFIED' ? modifiedAction : undefined,
        notes: reviewerNotes || `Decision ${decision.toLowerCase()} via Collections 360 portal`,
      });
      setReviewStatus(decision);
      setShowModifyInput(false);
      setToastMessage(`Recommendation successfully ${decision.toLowerCase()} and logged to audit trail.`);
      setTimeout(() => setToastMessage(null), 3500);
      if (onReviewCompleted) onReviewCompleted();
    } catch (err: any) {
      alert(`Error submitting decision: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
      {/* Toast banner */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ethical AI Guardrail Notice if Hardship Escalation */}
      {recommendation.is_hardship_escalation && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider block">
              Ethical AI & Vulnerability Protection Active
            </span>
            <p className="text-xs text-amber-800 mt-0.5">
              Financial hardship or severe personal distress detected. Hostile or automated recovery actions are disabled. Compassionate resolution and forbearance recommended.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Next Best Action (Explainable AI Engine)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {(recommendation.confidence_score * 100).toFixed(0)}% Confidence
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${
              reviewStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : reviewStatus === 'MODIFIED'
                ? 'bg-indigo-100 text-indigo-800'
                : reviewStatus === 'REJECTED'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {reviewStatus}
          </span>
        </div>
      </div>

      {/* Action Title */}
      <div className="mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Recommended Action
        </span>
        <div className="text-lg font-extrabold text-slate-900 mt-0.5">
          {reviewStatus === 'MODIFIED' ? modifiedAction : recommendation.recommended_action}
        </div>
      </div>

      {/* Why Rationale */}
      <div className="mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Why (Explainability)
        </span>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-normal">
          {recommendation.why_rationale}
        </p>
      </div>

      {/* Supporting Factors */}
      {recommendation.supporting_factors && recommendation.supporting_factors.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Supporting Factors
          </span>
          <ul className="space-y-1.5">
            {recommendation.supporting_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Points Used */}
      {recommendation.data_points_used && recommendation.data_points_used.length > 0 && (
        <div className="mb-5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Data Used:
          </span>
          {recommendation.data_points_used.map((dp, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Database className="w-2.5 h-2.5 text-slate-500" />
              {dp}
            </span>
          ))}
        </div>
      )}

      {/* Modification Input Box */}
      {showModifyInput && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Select or Enter Modified Action:
            </label>
            <select
              value={modifiedAction}
              onChange={(e) => setModifiedAction(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
            >
              <option value="Schedule phone contact">Schedule phone contact</option>
              <option value="Send WhatsApp reminder">Send WhatsApp reminder</option>
              <option value="Send payment link SMS">Send payment link SMS</option>
              <option value="Offer payment-plan discussion">Offer payment-plan discussion</option>
              <option value="Assign to specialist agent">Assign to specialist agent</option>
              <option value="Hold collections (Medical Hardship Review)">Hold collections (Medical Hardship Review)</option>
              <option value="No action / monitor">No action / monitor</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Reviewer Notes / Override Justification:
            </label>
            <input
              type="text"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g. Agent spoke with debtor yesterday; shifting to SMS"
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModifyInput(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDecision('MODIFIED')}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700"
            >
              Confirm Modification
            </button>
          </div>
        </div>
      )}

      {/* Human Review Controls */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          {reviewStatus === 'PENDING' ? (
            <span className="text-amber-700 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Human Review Required before execution
            </span>
          ) : (
            <span className="text-slate-600">
              Reviewed by {recommendation.reviewed_by || 'Collections Agent'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleDecision('REJECTED')}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => setShowModifyInput(!showModifyInput)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Modify
          </button>
          <button
            onClick={() => handleDecision('APPROVED')}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};
