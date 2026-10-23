import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';

export default function TaskCard({ task, userApplication = null }) {
  const {
    _id,
    title,
    description,
    category,
    priority,
    status,
    district,
    location,
    requiredVolunteers = 1,
    assignedVolunteersCount = 0,
    scheduledDate,
  } = task;

  const assigned = Number(assignedVolunteersCount) || 0;
  const required = Number(requiredVolunteers) || 1;
  const percentage = Math.min(100, Math.round((assigned / required) * 100));
  const availableSlots = Math.max(0, required - assigned);
  const isFull = assigned >= required;

  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Immediate / Ongoing';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner with Category & Badges */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {category}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <TaskStatusBadge status={priority} type="priority" />
            <TaskStatusBadge status={status} type="status" />
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Description Snippet */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Location & Schedule Info */}
        <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin size={14} className="text-red-500 shrink-0" />
            <span className="font-semibold text-slate-800">{district}:</span>
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-blue-600 shrink-0" />
            <span>Scheduled: <strong className="text-slate-700">{formattedDate}</strong></span>
          </div>
        </div>

        {/* Volunteer Capacity Progress Meter */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users size={14} className="text-amber-600" />
              <span>Volunteers Required</span>
            </div>
            <span className="font-bold text-slate-900">
              {assigned} / {required} assigned
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-slate-400'
                  : percentage >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>
              {isFull ? (
                <strong className="text-slate-600">Capacity Full</strong>
              ) : (
                <>
                  <strong className="text-emerald-700 font-bold">{availableSlots}</strong>{' '}
                  slots available
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400">{percentage}% filled</span>
          </div>
        </div>

        {/* Volunteer's active application status alert if applied */}
        {userApplication && (
          <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-medium">Your Application:</span>
            <TaskStatusBadge status={userApplication.status} type="application" />
          </div>
        )}
      </div>

      {/* Footer Safety Notice & Action CTA */}
      <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>Non-Hazardous Support</span>
        </div>

        <Link
          to={`/tasks/${_id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
        >
          <span>View Details</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
