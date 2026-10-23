import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import { reviewApplication } from '../../services/taskService';

export default function TaskApplicantRoster({
  task,
  applications = [],
  onApplicationUpdated,
}) {
  const [processingId, setProcessingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const handleReview = async (appId, decision) => {
    setProcessingId(appId);
    setFeedbackMessage(null);
    try {
      const response = await reviewApplication(appId, {
        status: decision,
      });

      setFeedbackMessage({
        type: 'success',
        text: `Application successfully ${decision.toLowerCase()}.`,
      });

      if (onApplicationUpdated) {
        onApplicationUpdated(response);
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || `Failed to ${decision.toLowerCase()} application.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const isTaskFull =
    (task.assignedVolunteersCount || 0) >= (task.requiredVolunteers || 1);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Volunteer Applications &amp; Assignments</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
              {applications.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinator Review: Approve suitable volunteers to assign them to this relief task.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
          Capacity:{' '}
          <strong className="text-slate-900">
            {task.assignedVolunteersCount || 0} / {task.requiredVolunteers}
          </strong>{' '}
          filled
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle size={15} className="text-emerald-600" />
          ) : (
            <ShieldAlert size={15} className="text-red-500" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="py-10 text-center">
          <Clock size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-xs font-bold text-slate-700">No applications yet</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
            Registered volunteers in {task.district} can discover and apply for this task through the public Volunteer Task Board.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100 space-y-3">
          {applications.map((app) => {
            const isPending = app.status === 'Pending';
            const isApproved = app.status === 'Approved';
            const isBusy = processingId === app._id;

            return (
              <div
                key={app._id}
                className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Volunteer profile summary */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {app.volunteer?.name || 'Registered Volunteer'}
                    </span>
                    <TaskStatusBadge status={app.status} type="application" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    {app.volunteer?.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        {app.volunteer.email}
                      </span>
                    )}
                    {app.volunteer?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {app.volunteer.phone}
                      </span>
                    )}
                    {app.volunteer?.district && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {app.volunteer.district}
                      </span>
                    )}
                  </div>

                  {/* Skills & Message */}
                  {app.skills && app.skills.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                        Skills:
                      </span>
                      {app.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.message && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                      &ldquo;{app.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Coordinator review actions */}
                <div className="flex flex-col sm:flex-row items-end md:items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Approved')}
                        disabled={isBusy || isTaskFull}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                          isTaskFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={
                          isTaskFull
                            ? 'Task has reached required volunteer capacity'
                            : 'Approve and assign to task'
                        }
                      >
                        {isBusy ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>Approve &amp; Assign</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Rejected')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle size={14} /> Assigned
                      </span>
                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Rejected')}
                        disabled={isBusy}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition"
                        title="Unassign / revoke approved status"
                      >
                        Unassign
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        <XCircle size={14} /> Rejected
                      </span>
                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Approved')}
                        disabled={isBusy || isTaskFull}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition"
                        title="Reconsider and approve"
                      >
                        Re-Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
