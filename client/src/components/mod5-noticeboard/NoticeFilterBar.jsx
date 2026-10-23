import { Search, Filter, RotateCcw, ShieldCheck, Flame } from 'lucide-react';
import {
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  SRI_LANKA_DISTRICTS,
} from '../../utils/noticeConstants';

export default function NoticeFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
}) {
  const {
    search = '',
    hazardType = 'All',
    severity = 'All',
    district = 'All',
    isOfficial = false,
    tab = 'active', // 'active' | 'official' | 'archive'
  } = filters;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top Feed Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'active', isOfficial: false })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'active' && !isOfficial
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Emergency Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'official', isOfficial: true })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isOfficial
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official DMC &amp; Met Only</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'archive', isOfficial: false })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'archive'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historical Archive
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{totalResults}</span> notices
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search alerts, keywords, agencies..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Hazard Type */}
        <div>
          <select
            value={hazardType}
            onChange={(e) => onFilterChange({ hazardType: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="All">All Hazard Types</option>
            {HAZARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <select
            value={severity}
            onChange={(e) => onFilterChange({ severity: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="All">All Severity Levels</option>
            {SEVERITY_LEVELS.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <select
            value={district}
            onChange={(e) => onFilterChange({ district: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="All">All 25 Districts</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d} District
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset & Quick Filter Summary */}
      {(search || hazardType !== 'All' || severity !== 'All' || district !== 'All' || isOfficial) && (
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Active filters applied</span>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
