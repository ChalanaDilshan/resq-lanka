import { MapPin, HeartHandshake, CheckCircle2, Clock } from 'lucide-react';

export default function SupplyItemCard({ item, onPledgeClick }) {
  const target = item.targetQuantity || 1;
  const pledged = item.pledgedQuantity || 0;
  const received = item.receivedQuantity || 0;
  const remaining = item.remainingQuantity !== undefined ? item.remainingQuantity : Math.max(0, target - pledged);

  const percentPledged = Math.min(100, Math.round((pledged / target) * 100));
  const percentReceived = Math.min(100, Math.round((received / target) * 100));

  const isFulfilled = received >= target || item.status === 'Fulfilled';
  const isFullyPledged = !isFulfilled && (pledged >= target || item.status === 'Fully Pledged');

  return (
    <div
      className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg ${
        isFulfilled
          ? 'border-emerald-200/90 bg-emerald-50/15'
          : isFullyPledged
          ? 'border-purple-200/90 bg-purple-50/10'
          : item.urgency === 'Immediate'
          ? 'border-red-200/90 hover:border-red-300'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="p-6">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
            {item.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                item.urgency === 'Immediate'
                  ? 'bg-red-600 text-white animate-pulse'
                  : item.urgency === 'High'
                  ? 'bg-amber-500 text-white'
                  : item.urgency === 'Medium'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {item.urgency}
            </span>

            {isFulfilled ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded inline-flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Stock Received</span>
              </span>
            ) : isFullyPledged ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded inline-flex items-center gap-1">
                <Clock size={11} />
                <span>Fully Pledged</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Needs Pledges
              </span>
            )}
          </div>
        </div>

        {/* Item Name */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {item.itemName}
        </h3>

        {/* Shelter Location */}
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
          <MapPin size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800">{item.shelterLocation}</div>
            <div className="text-[11px] text-slate-400">
              {item.district} District • {item.dropOffLocation || 'Reception Point'}
            </div>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
            "{item.notes}"
          </p>
        )}

        {/* Quantity Breakdown Grid */}
        <div className="mt-5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Target Quota:</span>
            <span className="font-black text-slate-800 text-sm">
              {target} <span className="font-medium text-xs text-slate-500">{item.unit}</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Pledged (In Pipeline):
            </span>
            <span className="font-bold text-blue-600">
              {pledged} {item.unit} ({percentPledged}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified in Stock:
            </span>
            <span className="font-bold text-emerald-600">
              {received} {item.unit} ({percentReceived}%)
            </span>
          </div>

          {/* Dual Visual Progress Bars */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              {/* Received Portion */}
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${percentReceived}%` }}
                title={`Received: ${received} ${item.unit}`}
              />
              {/* Pledged beyond received */}
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.max(0, percentPledged - percentReceived)}%` }}
                title={`Pledged: ${pledged} ${item.unit}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0</span>
              <span>Remaining: {remaining} {item.unit}</span>
              <span>{target}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 truncate">
          <span className="block font-semibold text-slate-700 truncate">
            {item.coordinatorName}
          </span>
          <span className="text-slate-400 truncate">{item.coordinatorContact}</span>
        </div>

        {isFulfilled ? (
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl cursor-default flex items-center gap-1.5 flex-shrink-0"
          >
            <CheckCircle2 size={15} />
            <span>Fulfilled</span>
          </button>
        ) : isFullyPledged ? (
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-purple-100 text-purple-800 text-xs font-bold rounded-xl cursor-default flex items-center gap-1.5 flex-shrink-0"
          >
            <Clock size={15} />
            <span>Fully Pledged</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPledgeClick(item)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition shadow-sm hover:shadow flex items-center gap-1.5 flex-shrink-0"
          >
            <HeartHandshake size={15} />
            <span>Pledge Donation</span>
          </button>
        )}
      </div>
    </div>
  );
}
