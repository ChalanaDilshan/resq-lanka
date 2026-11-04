import { useState } from 'react';
import { X, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';

export default function NoticeVerificationModal({ notice, isOpen, onClose, onConfirm }) {
  const [verificationStatus, setVerificationStatus] = useState(
    notice?.verificationStatus === 'Rejected' ? 'Rejected' : 'Verified'
  );
  const [isOfficial, setIsOfficial] = useState(notice?.isOfficial || false);
  const [notes, setNotes] = useState(notice?.verificationNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !notice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm({
        verificationStatus,
        isOfficial: verificationStatus === 'Verified' ? isOfficial : false,
        verificationNotes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900">Verify Notice Source Provenance</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
            <p className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-md border border-slate-200">
              {notice.title}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Claimed Agency / Reporter</label>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
              {notice.sourceName} {notice.sourceUrl && `(${notice.sourceUrl})`}
            </p>
          </div>

          {/* Verification Outcome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Determination</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVerificationStatus('Verified')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-semibold border transition ${
                  verificationStatus === 'Verified'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Verify Source</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationStatus('Rejected');
                  setIsOfficial(false);
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-semibold border transition ${
                  verificationStatus === 'Rejected'
                    ? 'bg-rose-900 border-rose-900 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-300" />
                <span>Reject / Discredit</span>
              </button>
            </div>
          </div>

          {/* Official Agency Toggle */}
          {verificationStatus === 'Verified' && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <input
                type="checkbox"
                id="isOfficial"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <label htmlFor="isOfficial" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Classify as Official National Agency Bulletin (DMC, Met Dept, NBRO, Irrigation)
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Notes / Reference Dispatch Code
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed with DMC Colombo Operations Room at 14:30 via official emergency bulletin #2026-B..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              {isSubmitting ? 'Saving...' : 'Save Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
