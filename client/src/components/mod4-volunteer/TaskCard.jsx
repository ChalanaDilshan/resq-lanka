import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
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
    : 'Immediate / Continuous';

  return (
    <article className="bg-white rounded-xl border border-slate-300 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-400 transition-colors">
      <div className="p-5">
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {category}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <TaskStatusBadge status={priority} type="priority" />
            <TaskStatusBadge status={status} type="status" />
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
          <Link
            to={`/tasks/${_id}`}
            className="hover:text-blue-700 focus:underline focus:outline-none"
          >
            {title}
          </Link>
        </h3>

        {/* Description Snippet */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Location & Schedule Details */}
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-start gap-2 text-slate-800">
            <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold">{district} District: </span>
              <span className="text-slate-600">{location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-slate-500 shrink-0" />
            <span>Date: <span className="font-medium text-slate-900">{formattedDate}</span></span>
          </div>
        </div>

        {/* Volunteer Quota Meter */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Users size={14} className="text-slate-500" />
              <span>Volunteers Required</span>
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {assigned} / {required} assigned
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                isFull
                  ? 'bg-slate-400'
                  : percentage >= 80
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
            <span>
              {isFull ? (
                <span className="font-medium text-slate-700">Quota Reached</span>
              ) : (
                <>
                  <span className="font-bold text-emerald-800">{availableSlots}</span> {availableSlots === 1 ? 'slot' : 'slots'} available
                </>
              )}
            </span>
            <span className="tabular-nums font-medium text-slate-600">{percentage}% staffed</span>
          </div>
        </div>

        {/* User Application Alert Banner if Applied */}
        {userApplication && (
          <div className="mt-3 bg-amber-50/90 border border-amber-300 rounded-lg p-2 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">Your status:</span>
            <TaskStatusBadge status={userApplication.status} type="application" />
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
          <span>Non-hazardous relief</span>
        </div>

        <Link
          to={`/tasks/${_id}`}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-lg text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
        >
          View Task
        </Link>
      </div>
    </article>
  );
}
