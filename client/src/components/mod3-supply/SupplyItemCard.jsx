import { MapPin, HeartHandshake, Clock, ShieldCheck } from 'lucide-react';

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
      className={`bg-white rounded-xl border transition-shadow duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
        isFulfilled
          ? 'border-green-300/80 bg-green-50/20'
          : isFullyPledged
          ? 'border-sky-300/80 bg-sky-50/15'
          : item.urgency === 'Immediate'
          ? 'border-rose-300 bg-rose-50/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top Categorization and Status Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md">
            {item.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                item.urgency === 'Immediate'
                  ? 'bg-rose-100 text-rose-950 border-rose-300'
                  : item.urgency === 'High'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : item.urgency === 'Medium'
                  ? 'bg-sky-100 text-sky-950 border-sky-300'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              {item.urgency} Urgency
            </span>

            {isFulfilled ? (
              <span className="text-xs font-semibold bg-green-100 text-green-950 border border-green-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-green-700 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Stock Received</span>
              </span>
            ) : isFullyPledged ? (
              <span className="text-xs font-semibold bg-sky-100 text-sky-950 border border-sky-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <Clock size={12} className="text-sky-700" />
                <span>Fully Pledged</span>
              </span>
            ) : (
              <span className="text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                Needs Pledges
              </span>
            )}
          </div>
        </div>

        {/* Item Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {item.itemName}
        </h3>

        {/* Shelter Location */}
        <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-600">
          <MapPin size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-900">{item.shelterLocation}</div>
            <div className="text-slate-500 text-[11px]">
              {item.district} District • {item.dropOffLocation || 'Reception Point'}
            </div>
          </div>
        </div>

        {/* Logistics notes */}
        {item.notes && (
          <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200/70 leading-relaxed italic">
            "{item.notes}"
          </p>
        )}

        {/* Quantity Breakdown Grid */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Target Quota:</span>
            <span className="font-bold text-slate-900 text-sm">
              {target} <span className="font-normal text-xs text-slate-500">{item.unit}</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Pledged (In Transit):
            </span>
            <span className="font-semibold text-sky-800">
              {pledged} {item.unit} ({percentPledged}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              Verified in Stock:
            </span>
            <span className="font-semibold text-green-800">
              {received} {item.unit} ({percentReceived}%)
            </span>
          </div>

          {/* Dual Visual Progress Bars */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
              {/* Received Portion */}
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${percentReceived}%` }}
                title={`Received: ${received} ${item.unit}`}
              />
              {/* Pledged beyond received */}
              <div
                className="h-full bg-sky-600 transition-all duration-300"
                style={{ width: `${Math.max(0, percentPledged - percentReceived)}%` }}
                title={`Pledged: ${pledged} ${item.unit}`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0</span>
              <span className="font-medium text-slate-700">Remaining Deficit: {remaining} {item.unit}</span>
              <span>{target}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-600 truncate">
          <span className="block font-semibold text-slate-800 truncate">
            {item.coordinatorName}
          </span>
          <span className="text-slate-500 text-[11px] truncate">{item.coordinatorContact}</span>
        </div>

        {isFulfilled ? (
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 bg-green-100 text-green-950 border border-green-300 text-xs font-semibold rounded-md cursor-default flex items-center gap-1.5 flex-shrink-0"
          >
            <ShieldCheck size={14} className="text-green-700" />
            <span>Fulfilled</span>
          </button>
        ) : isFullyPledged ? (
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 bg-sky-100 text-sky-950 border border-sky-300 text-xs font-semibold rounded-md cursor-default flex items-center gap-1.5 flex-shrink-0"
          >
            <Clock size={14} className="text-sky-700" />
            <span>Fully Pledged</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPledgeClick(item)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium text-xs rounded-md transition shadow-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <HeartHandshake size={15} />
            <span>Pledge Donation</span>
          </button>
        )}
      </div>
    </div>
  );
}
