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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Withdraw Emergency Alert</h3>
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

          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <p className="font-bold">Notice to be withdrawn from active public feed:</p>
            <p className="font-semibold text-slate-900">{notice.title}</p>
            <p className="text-[11px] text-slate-500">
              Withdrawing will immediately move this alert out of the active emergency feed into the archive with your reason visible.
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Official Withdrawal <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Danger level receded. DMC and Irrigation engineers confirmed normal reservoir discharge. All clear issued."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
            >
              {isSubmitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
