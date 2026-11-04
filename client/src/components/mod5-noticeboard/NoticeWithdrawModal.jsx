import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function NoticeWithdrawModal({ notice, isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !notice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('A specific reason of at least 5 characters is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Withdraw Emergency Alert</h3>
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

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 space-y-1">
            <p className="font-semibold">Notice to be withdrawn from active public broadcast:</p>
            <p className="font-bold text-slate-900">{notice.title}</p>
            <p className="text-[11px] text-slate-600">
              Withdrawing will remove this alert from the active emergency feed into the archive with your reason officially logged.
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="block text-xs font-semibold text-slate-700 mb-1">
              Official Reason for Withdrawal <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Flood waters receded below warning threshold. DMC & Irrigation Dept issued all-clear for Kalmunai basin."
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
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md transition shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-700"
            >
              {isSubmitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
