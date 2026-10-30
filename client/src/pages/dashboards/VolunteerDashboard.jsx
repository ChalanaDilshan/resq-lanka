import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Calendar,
  ShieldCheck,
  Bell,
  RefreshCw,
  AlertTriangle,
  FileText,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getTasks,
  getTaskStats,
  getMyApplications,
  withdrawApplication,
} from '../../services/taskService';
import { getNotices } from '../../services/noticeService';

export default function VolunteerDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [taskStats, setTaskStats] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [volunteerNotices, setVolunteerNotices] = useState([]);

  // Filter state for available tasks
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const [statsResult, tasksResult, myAppsResult, noticesResult] =
          await Promise.allSettled([
            getTaskStats(),
            getTasks({ status: 'Open' }),
            getMyApplications(),
            getNotices({ isOfficial: 'true' }),
          ]);

        if (isCancelled) return;

        if (statsResult.status === 'fulfilled') {
          setTaskStats(statsResult.value);
        }

        if (tasksResult.status === 'fulfilled' && Array.isArray(tasksResult.value)) {
          setAvailableTasks(tasksResult.value);
        }

        if (myAppsResult.status === 'fulfilled' && Array.isArray(myAppsResult.value)) {
          setMyApplications(myAppsResult.value);
        }

        if (noticesResult.status === 'fulfilled' && Array.isArray(noticesResult.value)) {
          const now = new Date();
          const active = noticesResult.value.filter(
            (n) =>
              n.publicationStatus === 'Published' &&
              (!n.expiresAt || new Date(n.expiresAt) > now)
          );
          setVolunteerNotices(active.slice(0, 3));
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching volunteer dashboard data:', err);
          setError('Unable to load volunteer operations board. Please check backend connection.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user, reloadTrigger]);

  // Handle application withdrawal
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this volunteer application?')) {
      return;
    }
    try {
      await withdrawApplication(applicationId);
      const updatedApps = await getMyApplications();
      setMyApplications(updatedApps);
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  // Derive metrics from my applications
  const pendingApps = myApplications.filter((a) => a.status === 'Pending');
  const activeAssignments = myApplications.filter((a) => a.status === 'Approved');
  const completedAssignments = myApplications.filter(
    (a) => a.status === 'Approved' && a.task?.status === 'Completed'
  );

  // Filter available tasks
  const filteredTasks = availableTasks.filter((task) => {
    if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
    if (selectedDistrict !== 'All' && task.district !== selectedDistrict) return false;
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-800 border-red-300 font-semibold';
      case 'High':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'Medium':
        return 'bg-sky-50 text-sky-900 border-sky-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  const getAppStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
      case 'Pending':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'Rejected':
        return 'bg-rose-50 text-rose-900 border-rose-300 font-medium';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
      default:
        return 'bg-blue-50 text-blue-900 border-blue-300 font-medium';
    }
  };

  return (
    <div className="space-y-6">
      {/* Civic Operations Welcome Header */}
      <header className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Civilian Relief Volunteer Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ayubowan, {user?.name || 'Volunteer Responder'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Assisting community dry rations distribution, emergency supply handling, and temporary shelter operations across Sri Lanka.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/tasks"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs sm:text-sm rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Users size={16} className="text-slate-700" />
              <span>Browse All Open Tasks</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-400">Open Tasks</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">
              {taskStats?.openTasks ?? availableTasks.length}
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-xs text-amber-300">Pending Applications</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 tabular-nums">
              {pendingApps.length}
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-xs text-emerald-300">Active Assignments</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {activeAssignments.length}
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-300">Completed Tasks</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">
              {completedAssignments.length}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadTrigger((v) => v + 1)}
            className="font-bold underline hover:text-amber-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: Available Tasks & Personal Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Available Tasks Board */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-300 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Available Relief Tasks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open community tasks awaiting volunteer sign-up
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All Categories</option>
                  <option value="Dry Rations & Food Packing">Food Packing</option>
                  <option value="Supply Distribution & Transport">Supply Transport</option>
                  <option value="Shelter Logistics & Management">Shelter Logistics</option>
                  <option value="Medical Aid & First Aid Support">Medical Aid</option>
                  <option value="Sanitation & Hygiene Maintenance">Sanitation</option>
                  <option value="General Non-Hazardous Assistance">General Assistance</option>
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All Districts</option>
                  <option value="Ampara">Ampara</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Galle">Galle</option>
                </select>
              </div>
            </div>

            {/* Task Cards List */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-500">Loading open tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const slots = Math.max(0, (task.requiredVolunteers || 0) - (task.assignedVolunteersCount || 0));

                  return (
                    <div
                      key={task._id}
                      className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded border ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority} Priority
                            </span>
                            <span className="text-xs text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded font-medium">
                              {task.category}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {task.district}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h3>
                        </div>

                        <span className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded shrink-0 tabular-nums">
                          {slots} slots left
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-500" />
                            <span>{task.location}</span>
                          </span>
                          {task.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-500" />
                              <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/tasks/${task._id}`}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs transition-colors"
                        >
                          View Task
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                No matching open tasks found for the selected category/district.
              </div>
            )}
          </section>

          {/* Section: My Applications & Active Assignments */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-300 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  My Volunteer Applications &amp; Assignments
                </h2>
              </div>
            </div>

            {myApplications.length > 0 ? (
              <div className="space-y-2.5">
                {myApplications.map((app) => {
                  const taskTitle = app.task?.title || 'Volunteer Relief Task';
                  const taskDistrict = app.task?.district || 'Sector';

                  return (
                    <div
                      key={app._id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900">{taskTitle}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${getAppStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {taskDistrict} District • Applied on{' '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {app.task?._id && (
                          <Link
                            to={`/tasks/${app.task._id}`}
                            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors"
                          >
                            Task Details
                          </Link>
                        )}

                        {app.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleWithdraw(app._id)}
                            className="px-2.5 py-1 text-red-700 hover:text-red-900 border border-red-200 hover:bg-red-50 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          >
                            <XCircle size={13} />
                            <span>Withdraw</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                You have not applied for any relief tasks yet. Browse the tasks above to join community operations.
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Safety Guidelines & Alerts */}
        <div className="space-y-6">
          {/* Section: Operational Safety Guidelines */}
          <section
            aria-label="Volunteer Safety Directives"
            className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Volunteer Safety Code</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Civilian responder directives strictly established under national disaster guidelines:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Wear high-visibility vests and protective closed footwear at all times.</li>
              <li>Civilian volunteers must strictly not engage in swift-water or structural rescues.</li>
              <li>Report injuries or hazards immediately to the on-site relief coordinator.</li>
              <li>Do not operate heavy equipment or electrical units without certified training.</li>
            </ul>
          </section>

          {/* Section: Field Weather & Disaster Bulletins */}
          <section
            aria-label="Field Emergency Bulletins"
            className="bg-white rounded-xl p-5 border border-slate-300 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-red-600" />
                <h2 className="text-sm font-bold text-slate-900">Emergency Bulletins</h2>
              </div>
              <Link to="/alerts" className="text-xs font-semibold text-blue-700 hover:underline">
                All Bulletins
              </Link>
            </div>

            {volunteerNotices.length > 0 ? (
              <div className="space-y-2.5">
                {volunteerNotices.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3 bg-red-50/60 border border-red-200 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-red-900 bg-red-100 border border-red-200 px-1.5 py-0.2 rounded">
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {alert.affectedDistricts?.slice(0, 2).join(', ')}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                No active severe bulletins.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
