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
        if (isMounted) {
          setError(err.message || 'Failed to load volunteer task details.');
        }
      } finally {
        if (isMounted) {
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
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">
          Loading relief task details...
        </p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={40} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Task Not Found</h2>
        <p className="text-xs text-slate-500">
          {error ||
            'The requested volunteer task does not exist or may have been deleted.'}
        </p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
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
    : 'Immediate / Ongoing Assistance';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Back Link Breadcrumb */}
      <div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Volunteer Task Board</span>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
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

      {/* Main Task Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Category & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
            {task.category}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <TaskStatusBadge status={task.priority} type="priority" />
            <TaskStatusBadge status={task.status} type="status" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {task.title}
          </h1>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        </div>

        {/* Location, Schedule, and Contact Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <MapPin size={14} className="text-red-500" />
              <span>Location / Assembly Point</span>
            </div>
            <p className="font-bold text-slate-800">{task.district} District</p>
            <p className="text-slate-600">{task.location}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Calendar size={14} className="text-blue-500" />
              <span>Scheduled Date</span>
            </div>
            <p className="font-bold text-slate-800">{formattedDate}</p>
            {task.deadline && (
              <p className="text-slate-500 text-[11px]">
                Sign-up deadline:{' '}
                {new Date(task.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Phone size={14} className="text-emerald-500" />
              <span>Coordinator Contact</span>
            </div>
            <p className="font-bold text-slate-800">
              {task.contactPerson || 'Relief Coordinator'}
            </p>
            <p className="text-slate-600">{task.contactPhone || '+94 63 222 2341'}</p>
          </div>
        </div>

        {/* Volunteer Capacity Progress Meter */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Users size={16} className="text-amber-600" />
              <span>Volunteer Capacity Allocation</span>
            </div>
            <span className="font-extrabold text-slate-900">
              {assigned} of {required} assigned
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
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

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              {isFull ? (
                <strong className="text-slate-700">Capacity Reached (Full)</strong>
              ) : (
                <>
                  <strong className="text-emerald-700 font-bold">{availableSlots}</strong>{' '}
                  volunteer slots open
                </>
              )}
            </span>
            <span className="font-semibold text-slate-400">{percentage}% filled</span>
          </div>
        </div>

        {/* Required Skills Tags */}
        {task.skillsRequired && task.skillsRequired.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recommended Skills &amp; Qualifications:
            </h4>
            <div className="flex flex-wrap gap-2">
              {task.skillsRequired.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-xl text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safety Instructions Banner */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
            <ShieldCheck size={18} className="text-amber-600 shrink-0" />
            <span>Safety Instructions &amp; Civilian Protection Guidelines</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {task.safetyInstructions ||
              'Volunteers must wear sturdy closed footwear and high-visibility vests. Maintain hand hygiene during food handling. Unsupervised water operations, power line clearance, and structural handling are strictly prohibited.'}
          </p>
        </div>

        {/* Volunteer Application Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status info */}
          <div>
            {userApplication ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">
                    Your Application Status:
                  </span>
                  <TaskStatusBadge
                    status={userApplication.status}
                    type="application"
                  />
                </div>
                {userApplication.status === 'Approved' && (
                  <p className="text-xs text-emerald-700 font-bold">
                    ✓ You are officially assigned to this task. Please report to the assembly point on time.
                  </p>
                )}
                {userApplication.status === 'Pending' && (
                  <p className="text-xs text-slate-500">
                    A relief coordinator will review your application shortly.
                  </p>
                )}
                {userApplication.status === 'Rejected' && (
                  <p className="text-xs text-red-600">
                    Your application was not selected. Check other relief opportunities.
                  </p>
                )}
              </div>
            ) : isFull ? (
              <p className="text-xs font-semibold text-slate-500">
                This relief task has reached its required volunteer quota.
              </p>
            ) : !isOpen ? (
              <p className="text-xs font-semibold text-slate-500">
                This task is currently {task.status.toLowerCase()} and not accepting new sign-ups.
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Join the relief effort. Sign up to assist displaced families in {task.district}.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {userApplication &&
            ['Pending', 'Approved'].includes(userApplication.status) ? (
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 rounded-xl text-xs font-bold transition"
              >
                Withdraw Application
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Sign In to Volunteer
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                disabled={isFull || !isOpen}
                className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                  isFull || !isOpen
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
                }`}
              >
                <Users size={15} />
                <span>Sign Up to Volunteer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Coordinator / Administrator Actions Section */}
      {isAdminOrCoordinator && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-400/20">
                Coordinator Panel
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Administrative Task Controls
              </h3>
            </div>

            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition self-start sm:self-auto"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition"
              >
                <Play size={13} />
                <span>Start Task (In Progress)</span>
              </button>
            )}

            {task.status !== 'Completed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Completed')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition"
              >
                <RotateCcw size={13} />
                <span>Re-Open Task</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Applicant Roster for Administrators/Coordinators */}
      {isAdminOrCoordinator && (
        <TaskApplicantRoster
          task={task}
          applications={applications}
          onApplicationUpdated={refreshTask}
        />
      )}

      {/* Volunteer Application Modal Drawer */}
      <TaskApplicationModal
        task={task}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          setFeedback({
            type: 'success',
            text: 'Your application was submitted successfully! A coordinator will review it.',
          });
          refreshTask();
        }}
      />
    </div>
  );
}
