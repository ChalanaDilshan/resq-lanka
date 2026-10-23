import { Search, X, RotateCcw, Filter } from 'lucide-react';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  SRI_LANKA_DISTRICTS,
} from '../../utils/taskConstants';

export default function TaskFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount = 0,
}) {
  const statusTabs = ['All', 'Open', 'Assigned', 'In Progress', 'Completed'];

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.district !== 'All' ||
    filters.priority !== 'All' ||
    filters.status !== 'All';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search Input & Status Tabs Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by title, location, or required skills..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const active = filters.status === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFilterChange('status', tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
          <Filter size={14} className="text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="All">All Categories</option>
          {TASK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* District Dropdown */}
        <select
          value={filters.district}
          onChange={(e) => onFilterChange('district', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="All">All Districts</option>
          {SRI_LANKA_DISTRICTS.map((dst) => (
            <option key={dst} value={dst}>
              {dst} District
            </option>
          ))}
        </select>

        {/* Priority Dropdown */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="All">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>

        {/* Reset button if filters active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}

        <div className="ml-auto text-slate-400 font-semibold text-[11px]">
          Showing <span className="text-slate-700 font-bold">{totalCount}</span> tasks
        </div>
      </div>
    </div>
  );
}
