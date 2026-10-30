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
    <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Search & Lifecycle Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search tasks by title, location, or skills..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none border border-slate-200 rounded-lg p-1 bg-slate-50">
          {statusTabs.map((tab) => {
            const active = filters.status === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFilterChange('status', tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold mr-1">
          <Filter size={14} className="text-slate-500" />
          <span>Filter by:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}

        <div className="ml-auto text-slate-500 font-medium text-xs">
          Showing <span className="text-slate-900 font-bold">{totalCount}</span> {totalCount === 1 ? 'task' : 'tasks'}
        </div>
      </div>
    </div>
  );
}
