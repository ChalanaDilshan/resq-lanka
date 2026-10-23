import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardList,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getTasks,
  getTaskStats,
  getMyApplications,
} from '../../services/taskService';
import TaskCard from '../../components/mod4-volunteer/TaskCard';
import TaskFilterBar from '../../components/mod4-volunteer/TaskFilterBar';
import TaskStatusBadge from '../../components/mod4-volunteer/TaskStatusBadge';

export default function TaskBoardPage() {
  const { user, activeRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'explore' or 'my-applications'
  const initialTab = searchParams.get('tab') === 'my-applications' ? 'my-applications' : 'explore';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    district: searchParams.get('district') || 'All',
    priority: searchParams.get('priority') || 'All',
    status: searchParams.get('status') || 'All',
  });

  const [tasks, setTasks] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Sync tab change to URL search params
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    if (newTab === 'my-applications') {
      newParams.set('tab', 'my-applications');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      district: 'All',
      priority: 'All',
      status: 'All',
    });
  };

  const handleRetry = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setError(null);
        const [tasksData, statsData] = await Promise.all([
          getTasks(filters),
          getTaskStats(),
        ]);

        if (!isMounted) return;
        setTasks(tasksData);
        setStats(statsData);

        if (user) {
          try {
            const apps = await getMyApplications();
            if (isMounted) setMyApplications(apps);
          } catch (appErr) {
            console.warn('Could not load user applications:', appErr.message);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load volunteer tasks.');
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
  }, [filters, user, reloadKey]);

  const isAdminOrCoordinator =
    activeRole === 'administrator' || activeRole === 'coordinator';

  // Map user applications by taskId for fast lookup
  const userApplicationsByTaskId = (myApplications || []).reduce((acc, app) => {
    const tId = app.task?._id || app.task;
    if (tId) acc[tId] = app;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Sri Lanka Community Disaster Relief Coordination</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Volunteer Relief Task Board
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Support displaced families across Sri Lanka with emergency dry rations packing,
            drinking water distribution, high-ground shelter logistics, and care assistance.
          </p>

          {/* Safety Disclaimer Banner */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5 flex items-start gap-3 backdrop-blur-sm">
            <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="text-white">Civilian Safety Protocol:</strong> Volunteers are deployed
              exclusively for organized, non-hazardous community relief roles. Swift-water rescues,
              hazardous structural work, or unauthorized boat missions are strictly prohibited.
            </div>
          </div>
        </div>

        {/* Action Button for Admins in Hero */}
        {isAdminOrCoordinator && (
          <div className="relative z-10 pt-4 flex flex-wrap gap-3">
            <Link
              to="/tasks/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all"
            >
              <PlusCircle size={17} />
              <span>Post New Relief Task</span>
            </Link>
          </div>
        )}

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Aggregate Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Tasks
              </p>
              <p className="text-xl font-extrabold text-slate-900">
                {stats.totalTasks || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Open Opportunities
              </p>
              <p className="text-xl font-extrabold text-emerald-700">
                {stats.openTasks || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Volunteers Needed
              </p>
              <p className="text-xl font-extrabold text-amber-700">
                {stats.totalVolunteersRequired || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Volunteers Assigned
              </p>
              <p className="text-xl font-extrabold text-indigo-700">
                {stats.totalVolunteersAssigned || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Row for Volunteers */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('explore')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass size={16} />
            <span>Browse Opportunities</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => handleTabChange('my-applications')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'my-applications'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users size={16} />
              <span>My Applications &amp; Assignments</span>
              {myApplications.length > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'my-applications'
                      ? 'bg-white text-amber-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {myApplications.length}
                </span>
              )}
            </button>
          )}
        </div>

        {isAdminOrCoordinator && (
          <Link
            to="/tasks/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Post Task</span>
          </Link>
        )}
      </div>

      {/* Tab 1: Explore Tasks */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <TaskFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalCount={tasks.length}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-slate-600">
                Fetching open relief tasks from ResQ-Lanka...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
              <AlertCircle size={36} className="text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-red-900">
                Unable to load tasks
              </h3>
              <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Users size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No relief tasks found matching your filters
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try selecting a different district or category, or clear your search terms.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  userApplication={userApplicationsByTaskId[task._id] || null}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Applications & Assignments */}
      {activeTab === 'my-applications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Your Volunteer Applications &amp; Assignments
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Track the status of your applications. Once approved by a relief coordinator, your
              assignment is officially confirmed.
            </p>

            {myApplications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Users size={36} className="text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  You haven&apos;t applied for any tasks yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse open relief tasks in your district and submit your volunteer application
                  to support community relief.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('explore')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Explore Relief Tasks
                </button>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {myApplications.map((app) => {
                  const task = app.task || {};
                  return (
                    <div
                      key={app._id}
                      className="py-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/tasks/${task._id || ''}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                          >
                            {task.title || 'Untitled Task'}
                          </Link>
                          <TaskStatusBadge status={app.status} type="application" />
                          {task.status && (
                            <TaskStatusBadge status={task.status} type="status" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                          <span>
                            District: <strong>{task.district || 'Ampara'}</strong>
                          </span>
                          <span>
                            Assembly Point: <strong>{task.location || 'On-Site'}</strong>
                          </span>
                          {app.availability && (
                            <span>
                              Availability: <strong>{app.availability}</strong>
                            </span>
                          )}
                        </div>

                        {app.reviewNotes && (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                            <strong>Coordinator Note:</strong> {app.reviewNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/tasks/${task._id || ''}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          <span>View Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
