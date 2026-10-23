import { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Verify Notice Source</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
            <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {notice.title}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Claimed Source</label>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {notice.sourceName} {notice.sourceUrl && `(${notice.sourceUrl})`}
            </p>
          </div>

          {/* Verification Outcome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Verification Decision</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVerificationStatus('Verified')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition ${
                  verificationStatus === 'Verified'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verify Source</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationStatus('Rejected');
                  setIsOfficial(false);
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition ${
                  verificationStatus === 'Rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject / Discredit</span>
              </button>
            </div>
          </div>

          {/* Official Agency Toggle */}
          {verificationStatus === 'Verified' && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <input
                type="checkbox"
                id="isOfficial"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isOfficial" className="text-xs font-bold text-blue-900 cursor-pointer">
                Mark as Official Disaster Agency Alert (e.g. DMC, Meteorology, NBRO)
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Notes / Reference Code
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed with DMC Colombo Operations Desk at 14:30 via bulletin #2026-B..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Save Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
