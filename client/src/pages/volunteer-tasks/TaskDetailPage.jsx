import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Phone,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getTaskById,
  updateTask,
  deleteTask,
  withdrawApplication,
} from '../../services/taskService';
import TaskStatusBadge from '../../components/mod4-volunteer/TaskStatusBadge';
import TaskApplicationModal from '../../components/mod4-volunteer/TaskApplicationModal';
import TaskApplicantRoster from '../../components/mod4-volunteer/TaskApplicantRoster';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeRole, isAuthenticated } = useAuth();

  const [task, setTask] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const refreshTask = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setError(null);
        const data = await getTaskById(id);
        if (!isMounted) return;

        if (data?.task) {
          setTask(data.task);
          setUserApplication(data.userApplication || null);
          setApplications(data.applications || []);
        } else {
          setTask(data);
        }
      } catch (err) {
        if (!isMounted) {
          setError(err.message || 'Failed to load volunteer task details.');
        }
      } finally {
        if (!isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const isAdminOrCoordinator =
    activeRole === 'administrator' || activeRole === 'coordinator';

  // Handle volunteer withdrawing their own application
  const handleWithdraw = async () => {
    if (!userApplication?._id) return;
    if (
      !window.confirm(
        'Are you sure you want to withdraw your volunteer application for this task?'
      )
    ) {
      return;
    }

    try {
      await withdrawApplication(userApplication._id);
      setFeedback({
        type: 'success',
        text: 'Your application has been withdrawn.',
      });
      refreshTask();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to withdraw application.',
      });
    }
  };

  // Handle coordinator administrative status change
  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to transition this task status to '${newStatus}'?`
      )
    ) {
      return;
    }

    setIsUpdatingStatus(true);
    setFeedback(null);
    try {
      await updateTask(task._id, { status: newStatus });
      setFeedback({
        type: 'success',
        text: `Task status updated to ${newStatus}.`,
      });
      refreshTask();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to update task status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this task? All volunteer applications will also be removed.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTask(task._id);
      navigate('/tasks');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to delete task.',
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-slate-600" />
        <p className="text-sm font-medium text-slate-600">
          Loading relief task details...
        </p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={36} className="text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Task Not Found</h2>
        <p className="text-xs text-slate-600">
          {error ||
            'The requested volunteer task does not exist or may have been removed.'}
        </p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Task Board</span>
        </Link>
      </div>
    );
  }

  const assigned = Number(task.assignedVolunteersCount) || 0;
  const required = Number(task.requiredVolunteers) || 1;
  const percentage = Math.min(100, Math.round((assigned / required) * 100));
  const availableSlots = Math.max(0, required - assigned);
  const isFull = assigned >= required;
  const isOpen = task.status === 'Open';

  const formattedDate = task.scheduledDate
    ? new Date(task.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Immediate / Continuous Assistance';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Task Board</span>
        </Link>
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-lg text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Task Detail Card */}
      <article className="bg-white rounded-xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Category & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {task.category}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <TaskStatusBadge status={task.priority} type="priority" />
            <TaskStatusBadge status={task.status} type="status" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {task.title}
          </h1>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        </div>

        {/* Logistics & Assembly Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <MapPin size={14} className="text-slate-500" />
              <span>Location / Assembly Point</span>
            </div>
            <p className="font-bold text-slate-900">{task.district} District</p>
            <p className="text-slate-600">{task.location}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Calendar size={14} className="text-slate-500" />
              <span>Scheduled Date</span>
            </div>
            <p className="font-bold text-slate-900">{formattedDate}</p>
            {task.deadline && (
              <p className="text-slate-500 text-[11px]">
                Deadline: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Phone size={14} className="text-slate-500" />
              <span>Coordinator Contact</span>
            </div>
            <p className="font-bold text-slate-900">{task.contactPerson || 'Relief Coordinator'}</p>
            <p className="text-slate-600">{task.contactPhone || '+94 63 222 2341'}</p>
          </div>
        </div>

        {/* Volunteer Capacity Allocation */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Users size={16} className="text-slate-600" />
              <span>Volunteer Capacity Allocation</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">
              {assigned} of {required} assigned
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded h-2.5 overflow-hidden">
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

          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            <span>
              {isFull ? (
                <span className="font-semibold text-slate-800">Capacity Reached</span>
              ) : (
                <>
                  <span className="font-bold text-emerald-800">{availableSlots}</span> {availableSlots === 1 ? 'slot' : 'slots'} available
                </>
              )}
            </span>
            <span className="tabular-nums font-medium">{percentage}% filled</span>
          </div>
        </div>

        {/* Required Skills & Qualifications */}
        {task.skillsRequired && task.skillsRequired.length > 0 && (
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold text-slate-900">
              Recommended Skills &amp; Qualifications
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {task.skillsRequired.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safety Instructions Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
            <ShieldCheck size={16} className="text-amber-700 shrink-0" />
            <span>Safety Instructions &amp; Civilian Protection Guidelines</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {task.safetyInstructions ||
              'Volunteers must wear sturdy closed footwear and high-visibility vests. Maintain hand hygiene during food handling. Unsupervised water operations, power line clearance, and structural handling are strictly prohibited.'}
          </p>
        </div>

        {/* Volunteer Application Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            {userApplication ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">
                    Your Application:
                  </span>
                  <TaskStatusBadge
                    status={userApplication.status}
                    type="application"
                  />
                </div>
                {userApplication.status === 'Approved' && (
                  <p className="text-xs text-emerald-800 font-semibold">
                    You are confirmed for this relief task. Please report to the assembly point on schedule.
                  </p>
                )}
                {userApplication.status === 'Pending' && (
                  <p className="text-xs text-slate-600">
                    A relief coordinator is reviewing your application.
                  </p>
                )}
                {userApplication.status === 'Rejected' && (
                  <p className="text-xs text-red-700 font-medium">
                    Application was not selected for this assignment.
                  </p>
                )}
              </div>
            ) : isFull ? (
              <p className="text-xs font-medium text-slate-600">
                This relief task has reached its required volunteer quota.
              </p>
            ) : !isOpen ? (
              <p className="text-xs font-medium text-slate-600">
                This task is currently marked {task.status.toLowerCase()} and is not accepting applications.
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Sign up to support civilian relief operations in {task.district}.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userApplication &&
            ['Pending', 'Approved'].includes(userApplication.status) ? (
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:text-red-700 hover:border-red-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Withdraw Application
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Sign In to Volunteer
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                disabled={isFull || !isOpen}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  isFull || !isOpen
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 active:bg-black text-white focus:ring-2 focus:ring-slate-900'
                }`}
              >
                <Users size={15} />
                <span>Sign Up for this Task</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Coordinator Control Console */}
      {isAdminOrCoordinator && (
        <section
          aria-label="Coordinator Task Controls"
          className="bg-slate-900 text-white rounded-xl p-6 sm:p-7 space-y-4 border border-slate-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-emerald-400">
                Coordinator Console
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Task Management Controls
              </h2>
            </div>

            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <Trash2 size={13} />
              <span>Delete Task</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-2 font-medium">
              Update Status:
            </span>

            {task.status !== 'In Progress' && (
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                <Play size={13} />
                <span>Mark In Progress</span>
              </button>
            )}

            {task.status !== 'Completed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Completed')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                <CheckCircle size={13} />
                <span>Mark Completed</span>
              </button>
            )}

            {task.status !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Cancelled')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                <XCircle size={13} />
                <span>Cancel Task</span>
              </button>
            )}

            {['Completed', 'Cancelled'].includes(task.status) && (
              <button
                type="button"
                onClick={() => handleStatusChange('Open')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                <RotateCcw size={13} />
                <span>Re-Open Task</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Embedded Applicant Roster */}
      {isAdminOrCoordinator && (
        <TaskApplicantRoster
          task={task}
          applications={applications}
          onApplicationUpdated={refreshTask}
        />
      )}

      {/* Volunteer Application Modal */}
      <TaskApplicationModal
        task={task}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          setFeedback({
            type: 'success',
            text: 'Your application has been submitted for coordinator review.',
          });
          refreshTask();
        }}
      />
    </div>
  );
}
