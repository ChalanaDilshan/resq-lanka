import { useState } from 'react';
import { Truck, Clock, XCircle, MapPin, ShieldCheck } from 'lucide-react';

export default function PledgeLedgerTable({
  pledges,
  isCoordinatorOrAdmin,
  onUpdateStatus,
  filterStatus,
  onFilterChange,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleAction = async (pledgeId, newStatus) => {
    if (newStatus === 'Cancelled') {
      if (!confirm('Are you sure you want to cancel this donor pledge? The remaining requirement will be restored.')) {
        return;
      }
    } else if (newStatus === 'Received & Verified') {
      if (!confirm('Confirm physical receipt of this supply donation at the relief facility? This will increment physically verified stock.')) {
        return;
      }
    }

    setUpdatingId(pledgeId);
    try {
      await onUpdateStatus(pledgeId, newStatus);
    } catch (err) {
      alert(err.message || 'Failed to update pledge status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPledges = pledges.filter((p) => {
    return filterStatus === 'All' || p.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-xs font-semibold mb-1">
            <Truck size={14} className="text-slate-700" />
            <span>Pledge Dispatch & Verification Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Donor Pledge Tracking Board</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Track community relief commitments from initial pledge submission to verified arrival at shelter storage facilities.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-800"
          >
            <option value="All">All Pledges ({pledges.length})</option>
            <option value="Pledged">Pledged (Awaiting Dispatch)</option>
            <option value="In Transit">In Transit</option>
            <option value="Received & Verified">Received & Verified</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Pledge / Donor</th>
                <th className="py-3 px-4">Relief Item</th>
                <th className="py-3 px-4">Destination Shelter</th>
                <th className="py-3 px-4">Pledged Amount</th>
                <th className="py-3 px-4">Delivery Method</th>
                <th className="py-3 px-4">Tracking Status</th>
                <th className="py-3 px-4 text-right">
                  {isCoordinatorOrAdmin ? 'Verification Actions' : 'Ledger Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPledges.map((p) => {
                const isReceived = p.status === 'Received & Verified';
                const isCancelled = p.status === 'Cancelled';
                const isInTransit = p.status === 'In Transit';
                const isPledged = p.status === 'Pledged';

                return (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Donor Info (Masked if non-admin) */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.donorName}</div>
                      <div className="text-[11px] text-slate-600">
                        {p.donorPhone || 'No phone'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {p.donorEmail || 'No email'}
                      </div>
                    </td>

                    {/* Item */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.itemName}
                    </td>

                    {/* Shelter */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-rose-600 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">{p.shelterLocation}</span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-slate-900">
                        {p.pledgedQuantity}
                      </span>{' '}
                      <span className="text-slate-500 font-normal">{p.unit}</span>
                    </td>

                    {/* Delivery Method */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">{p.deliveryMethod}</span>
                      {p.donorNotes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 truncate max-w-[130px]">
                          "{p.donorNotes}"
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 border ${
                          isReceived
                            ? 'bg-green-100 text-green-950 border-green-300'
                            : isInTransit
                            ? 'bg-sky-100 text-sky-950 border-sky-300'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-950 border-rose-300'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                      >
                        {isReceived && (
                          <svg className="w-3 h-3 text-green-700 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isInTransit && <Truck size={12} className="text-sky-700" />}
                        {isPledged && <Clock size={12} className="text-amber-700" />}
                        {isCancelled && <XCircle size={12} className="text-rose-700" />}
                        <span>{p.status}</span>
                      </span>

                      {/* Verification Audit Stamp */}
                      {isReceived && p.verifiedBy && (
                        <div className="text-[10px] text-green-800 font-medium mt-1">
                          Verified by: {p.verifiedBy}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isCoordinatorOrAdmin ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isPledged && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'In Transit')}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-semibold text-xs rounded-md transition disabled:opacity-50"
                            >
                              Dispatch
                            </button>
                          )}

                          {!isReceived && !isCancelled && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'Received & Verified')}
                              className="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-md transition shadow-xs disabled:opacity-50"
                            >
                              Verify & Receive
                            </button>
                          )}

                          {!isReceived && !isCancelled && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'Cancelled')}
                              className="px-2 py-1 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-md text-xs font-medium transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}

                          {isReceived && (
                            <span className="text-xs font-semibold text-green-800 inline-flex items-center gap-1">
                              <ShieldCheck size={14} className="text-green-700" />
                              <span>Verified in Stock</span>
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs font-medium text-slate-500">
                              Cancelled
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">
                          {isReceived ? 'In Facility Storage' : 'Pending Intake'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPledges.length === 0 && (
          <div className="text-center py-14 bg-white">
            <Truck size={32} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No pledges match the selected filter.</h4>
            <p className="text-xs text-slate-500 mt-1">
              Select another status filter or submit a pledge from the Supply Board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
