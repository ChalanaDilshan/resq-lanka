/**
 * ResQ-Lanka Field Status & Priority Indicators
 * High contrast, accessible, devoid of pulsing decorative gimmicks.
 */
export default function TaskStatusBadge({ status, type = 'status' }) {
  if (type === 'priority') {
    const priorityConfigs = {
      Urgent: 'bg-red-50 text-red-800 border-red-300 font-semibold',
      High: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      Medium: 'bg-sky-50 text-sky-900 border-sky-300 font-medium',
      Low: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
    };
    const style =
      priorityConfigs[status] ||
      'bg-slate-100 text-slate-700 border-slate-300 font-medium';

    const dotColors = {
      Urgent: 'bg-red-600',
      High: 'bg-amber-600',
      Medium: 'bg-sky-600',
      Low: 'bg-slate-400',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
            dotColors[status] || 'bg-slate-400'
          }`}
        />
        {status} Priority
      </span>
    );
  }

  if (type === 'application') {
    const appConfigs = {
      Pending: 'bg-amber-50 text-amber-900 border-amber-300',
      Approved: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      Rejected: 'bg-rose-50 text-rose-900 border-rose-300',
      Withdrawn: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    const style =
      appConfigs[status] || 'bg-slate-100 text-slate-700 border-slate-300';

    const dotColors = {
      Approved: 'bg-emerald-600',
      Pending: 'bg-amber-600',
      Rejected: 'bg-rose-600',
      Withdrawn: 'bg-slate-400',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${style}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
            dotColors[status] || 'bg-slate-400'
          }`}
        />
        Application: {status}
      </span>
    );
  }

  // Default: Task Lifecycle Status
  const statusConfigs = {
    Open: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
    Assigned: 'bg-blue-50 text-blue-900 border-blue-300 font-semibold',
    'In Progress': 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
    Completed: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
    Cancelled: 'bg-rose-50 text-rose-900 border-rose-300 font-medium',
  };

  const dotColors = {
    Open: 'bg-emerald-600',
    Assigned: 'bg-blue-600',
    'In Progress': 'bg-amber-600',
    Completed: 'bg-slate-500',
    Cancelled: 'bg-rose-600',
  };

  const style =
    statusConfigs[status] || 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs border ${style}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
          dotColors[status] || 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
}
