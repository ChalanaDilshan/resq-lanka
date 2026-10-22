import { useState } from 'react';
import { Truck, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react';

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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold mb-1">
            <Truck size={14} />
            <span>Pledge Dispatch & Verification Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Donor Pledge Tracking Board</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track community relief commitments from initial pledge submission to verified arrival at shelter storage facilities.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Pledge / Donor</th>
                <th className="py-3.5 px-4 font-bold">Relief Item</th>
                <th className="py-3.5 px-4 font-bold">Destination Shelter</th>
                <th className="py-3.5 px-4 font-bold">Pledged Amount</th>
                <th className="py-3.5 px-4 font-bold">Delivery Method</th>
                <th className="py-3.5 px-4 font-bold">Tracking Status</th>
                <th className="py-3.5 px-4 font-bold text-right">
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
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    {/* Donor Info (Masked if non-admin) */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{p.donorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.donorPhone || 'No phone'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                        {p.donorEmail || 'No email'}
                      </div>
                    </td>

                    {/* Item */}
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {p.itemName}
                    </td>

                    {/* Shelter */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin size={13} className="text-red-500 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">{p.shelterLocation}</span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4">
                      <span className="text-sm font-black text-blue-600">
                        {p.pledgedQuantity}
                      </span>{' '}
                      <span className="text-slate-500 font-medium">{p.unit}</span>
                    </td>

                    {/* Delivery Method */}
                    <td className="py-4 px-4 text-slate-600">
                      <span className="font-medium">{p.deliveryMethod}</span>
                      {p.donorNotes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[130px]">
                          "{p.donorNotes}"
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 ${
                          isReceived
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInTransit
                            ? 'bg-blue-100 text-blue-800'
                            : isCancelled
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isReceived && <CheckCircle2 size={12} />}
                        {isInTransit && <Truck size={12} />}
                        {isPledged && <Clock size={12} />}
                        {isCancelled && <XCircle size={12} />}
                        <span>{p.status}</span>
                      </span>

                      {/* Verification Audit Stamp */}
                      {isReceived && p.verifiedBy && (
                        <div className="text-[9.5px] text-emerald-600 font-medium mt-1">
                          By: {p.verifiedBy}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {isCoordinatorOrAdmin ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isPledged && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'In Transit')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[10.5px] rounded-lg transition disabled:opacity-50"
                            >
                              Dispatch
                            </button>
                          )}

                          {!isReceived && !isCancelled && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'Received & Verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-lg transition shadow-xs disabled:opacity-50"
                            >
                              Verify & Receive
                            </button>
                          )}

                          {!isReceived && !isCancelled && (
                            <button
                              type="button"
                              disabled={updatingId === p._id}
                              onClick={() => handleAction(p._id, 'Cancelled')}
                              className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-[10.5px] font-semibold transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}

                          {isReceived && (
                            <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Verified in Stock</span>
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Cancelled
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isReceived ? '✓ In Shelter Inventory' : 'Pending Receipt'}
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
          <div className="text-center py-16 bg-white">
            <Truck size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No pledges match the selected filter.</h4>
            <p className="text-xs text-slate-400 mt-1">
              Select another status filter or submit a pledge from the Supply Board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
