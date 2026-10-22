import { useState } from 'react';
import { HeartHandshake, CheckCircle2, MapPin, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PledgeModal({ item, user, onClose, onPledgeSuccess, onViewTracker }) {
  const [pledgeForm, setPledgeForm] = useState({
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '077 123 4567',
    pledgedQuantity: Math.min(10, item.remainingQuantity || 1),
    deliveryMethod: 'Direct Drop-off',
    donorNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState(null);

  const maxAllowed = item.remainingQuantity || 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Pre-flight client validation
    const qty = Number(pledgeForm.pledgedQuantity);
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      setErrorMessage('Please enter a valid positive whole number for pledge quantity.');
      return;
    }

    if (qty > maxAllowed) {
      setErrorMessage(`Maximum pledge quantity currently needed is ${maxAllowed} ${item.unit}.`);
      return;
    }

    if (!pledgeForm.donorName.trim()) {
      setErrorMessage('Please provide your name or organization name.');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(pledgeForm.donorEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!pledgeForm.donorPhone.trim()) {
      setErrorMessage('Please enter a contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await onPledgeSuccess(item._id, pledgeForm);
      setReceipt({
        receiptId: `PLEDGE-${Math.floor(100000 + Math.random() * 900000)}`,
        item,
        pledge: response?.pledge || pledgeForm,
        date: new Date().toLocaleString(),
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit pledge. Please check inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition z-10"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          {receipt ? (
            /* Confirmation Receipt View */
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={32} className="stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Thank You for Your Generous Relief Pledge!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your pledge commitment has been recorded and safely decrements the remaining need.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5 text-left mt-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Confirmation ID:</span>
                  <span className="font-mono font-bold text-slate-900">{receipt.receiptId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Pledged Relief Item:</span>
                  <span className="font-bold text-slate-900">{item.itemName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Quantity Pledged:</span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    {receipt.pledge.pledgedQuantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Destination Center:</span>
                  <span className="font-semibold text-slate-800">{item.shelterLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Drop-off Staging Area:</span>
                  <span className="font-medium text-slate-700">{item.dropOffLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Delivery Method:</span>
                  <span className="font-medium text-slate-700">{receipt.pledge.deliveryMethod}</span>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onViewTracker) onViewTracker();
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  View in Pledge Tracker
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Pledge Input Form */
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HeartHandshake className="text-blue-600 stroke-[2.5]" size={22} />
                <h3 className="text-xl font-bold text-slate-900">Pledge Relief Supplies</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Commit critical supplies to displaced flood and disaster victims in Sri Lanka.
              </p>

              {/* Selected Item Summary Card */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl mb-4 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">{item.itemName}</div>
                <div className="text-slate-600 flex items-center gap-1">
                  <MapPin size={12} className="text-red-500 flex-shrink-0" />
                  <span>{item.shelterLocation} ({item.district})</span>
                </div>
                <div className="mt-2 flex justify-between items-center pt-2 border-t border-blue-100 text-xs">
                  <span className="text-slate-500 font-medium">Remaining Needed:</span>
                  <span className="font-black text-red-600 text-sm">
                    {maxAllowed} {item.unit}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity to Pledge ({item.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={maxAllowed}
                    value={pledgeForm.pledgedQuantity}
                    onChange={(e) =>
                      setPledgeForm({
                        ...pledgeForm,
                        pledgedQuantity: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Maximum you can pledge for this item is {maxAllowed} {item.unit}.
                  </p>
                </div>

                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={pledgeForm.donorName}
                    onChange={(e) =>
                      setPledgeForm({ ...pledgeForm, donorName: e.target.value })
                    }
                    placeholder="e.g. Kasun Jayawardena"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={pledgeForm.donorPhone}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, donorPhone: e.target.value })
                      }
                      placeholder="077 123 4567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={pledgeForm.donorEmail}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, donorEmail: e.target.value })
                      }
                      placeholder="donor@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Method *
                  </label>
                  <select
                    value={pledgeForm.deliveryMethod}
                    onChange={(e) =>
                      setPledgeForm({ ...pledgeForm, deliveryMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Direct Drop-off">Direct Drop-off at Shelter Reception</option>
                    <option value="Volunteer Pickup">Request Volunteer Relief Pickup</option>
                    <option value="Courier / Dispatch">Third-Party Courier / Logistics Dispatch</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Drop-off Notes / Estimated Date
                  </label>
                  <input
                    type="text"
                    value={pledgeForm.donorNotes}
                    onChange={(e) =>
                      setPledgeForm({ ...pledgeForm, donorNotes: e.target.value })
                    }
                    placeholder="e.g. Bringing 50 packs tomorrow around 10:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Privacy assurance */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Donor contact details are protected and only visible to authorized coordinators.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  <HeartHandshake size={16} />
                  <span>
                    {submitting
                      ? 'Processing Pledge...'
                      : `Confirm Pledge of ${pledgeForm.pledgedQuantity || 0} ${item.unit}`}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
