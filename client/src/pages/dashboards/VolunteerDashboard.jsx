import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Calendar,
  ShieldCheck,
  Bell,
  ArrowRight,
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
      // Reload applications
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getAppStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-amber-100 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Volunteer Task Board &bull; Field Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ayubowan, {user?.name || 'Volunteer Responder'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              Support relief distribution, food packing, and shelter coordination across Sri Lanka. Thank you for your humanitarian service.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/tasks"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-amber-900 font-extrabold text-sm rounded-2xl shadow-lg hover:bg-amber-50 transition-all transform hover:-translate-y-0.5"
            >
              <Users size={18} className="stroke-[2.5] text-amber-700" />
              <span>Browse All Open Tasks</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-4 py-3.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-2xl border border-white/20 transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/15">
          <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-200">Open Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-white">
              {taskStats?.openTasks ?? availableTasks.length}
            </p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-200">Pending Applications</p>
            <p className="text-xl sm:text-2xl font-black text-white">
              {pendingApps.length}
            </p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-300">Active Assignments</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-200">
              {activeAssignments.length}
            </p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-200">Completed Relief Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-white">
              {completedAssignments.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadTrigger((v) => v + 1)}
            className="font-bold underline hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: Available Tasks & Personal Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Available Tasks Board */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Available Relief Tasks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Open community tasks awaiting volunteer sign-up
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
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
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
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
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading open tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const slots = Math.max(0, (task.requiredVolunteers || 0) - (task.assignedVolunteersCount || 0));

                  return (
                    <div
                      key={task._id}
                      className="p-5 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-2xl transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority} Priority
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {task.category}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {task.district}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                        </div>

                        <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">
                          {slots} slots left
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{task.location}</span>
                          </span>
                          {task.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/tasks/${task._id}`}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1"
                        >
                          <span>Apply / Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No matching open tasks found for the selected category/district.
              </div>
            )}
          </section>

          {/* Section: My Applications & Active Assignments */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    My Volunteer Applications &amp; Assignments
                  </h3>
                  <p className="text-xs text-slate-500">
                    Status of your submissions and assigned field duties
                  </p>
                </div>
              </div>
            </div>

            {myApplications.length > 0 ? (
              <div className="space-y-3">
                {myApplications.map((app) => {
                  const taskTitle = app.task?.title || 'Volunteer Relief Task';
                  const taskDistrict = app.task?.district || 'Sector';

                  return (
                    <div
                      key={app._id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{taskTitle}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getAppStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {taskDistrict} &bull; Applied on{' '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {app.task?._id && (
                          <Link
                            to={`/tasks/${app.task._id}`}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                          >
                            Task Details
                          </Link>
                        )}

                        {app.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleWithdraw(app._id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
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
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                You have not applied for any relief tasks yet. Browse the tasks above to join community operations.
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Safety Guidelines & Alerts */}
        <div className="space-y-8">
          {/* Section: Operational Safety Guidelines */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">Volunteer Safety Code</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ResQ-Lanka prioritizes responder safety. Civilian volunteers must observe strictly:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Wear high-visibility vests and protective closed footwear.</li>
              <li>Untrained volunteers must not engage in swift-water or structural rescues.</li>
              <li>Report injuries or hazards immediately to the site relief coordinator.</li>
              <li>Do not operate heavy equipment or electrical units without certification.</li>
            </ul>
          </section>

          {/* Section: Field Weather & Disaster Bulletins */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Field Weather Bulletins</h3>
              </div>
              <Link to="/alerts" className="text-xs font-bold text-rose-600 hover:underline">
                All Bulletins
              </Link>
            </div>

            {volunteerNotices.length > 0 ? (
              <div className="space-y-3">
                {volunteerNotices.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {alert.affectedDistricts?.slice(0, 2).join(', ')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No active severe bulletins.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
