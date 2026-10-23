/**
 * Modern status and priority badges with clear color contrast and text indicator
 */
export default function TaskStatusBadge({ status, type = 'status' }) {
  if (type === 'priority') {
    const priorityConfigs = {
      Urgent: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300/40',
      High: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40',
      Medium: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-300/40',
      Low: 'bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-slate-300/40',
    };
    const style =
      priorityConfigs[status] ||
      'bg-slate-50 text-slate-700 border-slate-200';

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            status === 'Urgent'
              ? 'bg-red-500 animate-pulse'
              : status === 'High'
              ? 'bg-amber-500'
              : status === 'Medium'
              ? 'bg-blue-500'
              : 'bg-slate-400'
          }`}
        />
        {status} Priority
      </span>
    );
  }

  if (type === 'application') {
    const appConfigs = {
      Pending: 'bg-amber-50 text-amber-800 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Rejected: 'bg-red-50 text-red-800 border-red-200',
      Withdrawn: 'bg-slate-100 text-slate-600 border-slate-300',
    };
    const style =
      appConfigs[status] || 'bg-slate-50 text-slate-700 border-slate-200';

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            status === 'Approved'
              ? 'bg-emerald-600'
              : status === 'Pending'
              ? 'bg-amber-500 animate-pulse'
              : status === 'Rejected'
              ? 'bg-red-500'
              : 'bg-slate-400'
          }`}
        />
        Application: {status}
      </span>
    );
  }

  // Default: Task Status
  const statusConfigs = {
    Open: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300/30',
    Assigned: 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-300/30',
    'In Progress':
      'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300/30',
    Completed:
      'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-300/30',
    Cancelled:
      'bg-red-50 text-red-800 border-red-200 ring-1 ring-red-300/30',
  };

  const style =
    statusConfigs[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide ${style}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1.5 ${
          status === 'Open'
            ? 'bg-emerald-500'
            : status === 'Assigned'
            ? 'bg-blue-600'
            : status === 'In Progress'
            ? 'bg-amber-500 animate-pulse'
            : status === 'Completed'
            ? 'bg-slate-500'
            : 'bg-red-500'
        }`}
      />
      {status}
    </span>
  );
}
