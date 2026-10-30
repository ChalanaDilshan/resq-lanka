import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
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
        text: `Application successfully marked as ${decision.toLowerCase()}.`,
      });

      if (onApplicationUpdated) {
        onApplicationUpdated(response);
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || `Failed to update application to ${decision.toLowerCase()}.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const isTaskFull =
    (task.assignedVolunteersCount || 0) >= (task.requiredVolunteers || 1);

  return (
    <section
      aria-label="Volunteer Applicant Roster"
      className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Volunteer Applicants &amp; Roster</span>
            <span className="text-xs px-2 py-0.2 rounded font-bold bg-slate-100 text-slate-800 border border-slate-200 tabular-nums">
              {applications.length}
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Coordinator Review: Approve qualified volunteers to assign them to this relief task.
          </p>
        </div>

        <div className="text-xs font-medium px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700">
          Capacity:{' '}
          <span className="text-slate-900 font-bold tabular-nums">
            {task.assignedVolunteersCount || 0} / {task.requiredVolunteers}
          </span>{' '}
          filled
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle size={15} className="text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-red-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="py-10 text-center">
          <Clock size={30} className="mx-auto text-slate-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-800">No applications received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Registered volunteers in {task.district} will appear here upon submitting an application.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-200 space-y-3">
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
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {app.volunteer?.name || 'Registered Volunteer'}
                    </span>
                    <TaskStatusBadge status={app.status} type="application" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    {app.volunteer?.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <span>{app.volunteer.email}</span>
                      </span>
                    )}
                    {app.volunteer?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{app.volunteer.phone}</span>
                      </span>
                    )}
                    {app.volunteer?.district && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{app.volunteer.district}</span>
                      </span>
                    )}
                  </div>

                  {/* Skills tags */}
                  {app.skills && app.skills.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-xs text-slate-500 font-medium mr-1">
                        Skills:
                      </span>
                      {app.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.message && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
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
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isTaskFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white'
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle size={14} /> Assigned
                      </span>
                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Rejected')}
                        disabled={isBusy}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-red-700 underline transition-colors"
                        title="Unassign volunteer"
                      >
                        Unassign
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-700 flex items-center gap-1">
                        <XCircle size={14} /> Rejected
                      </span>
                      <button
                        type="button"
                        onClick={() => handleReview(app._id, 'Approved')}
                        disabled={isBusy || isTaskFull}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-emerald-800 underline transition-colors"
                        title="Re-approve volunteer"
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
    </section>
  );
}
