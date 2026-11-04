import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ClipboardList,
  Compass,
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
  const initialTab =
    searchParams.get('tab') === 'my-applications' ? 'my-applications' : 'explore';
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
        if (!isMounted) {
          setError(err.message || 'Failed to load volunteer tasks.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Civic Operations Header */}
      <header className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>National Disaster Relief Operations</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Volunteer Relief Task Board
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Mobilizing civilian relief volunteers across Sri Lanka for dry rations packaging,
              drinking water supply logistics, shelter reception, and non-hazardous community assistance.
            </p>
          </div>

          {isAdminOrCoordinator && (
            <div className="shrink-0">
              <Link
                to="/tasks/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors focus:ring-2 focus:ring-emerald-400"
              >
                <Plus size={16} />
                <span>Post New Task</span>
              </Link>
            </div>
          )}
        </div>

        {/* Civilian Safety Protocol Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-start gap-3 text-xs bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 space-y-1">
            <span className="font-semibold text-white">Civilian Safety Directive: </span>
            <span>
              Volunteers are assigned strictly to authorized, non-hazardous community relief roles.
              Swift-water rescues, high-risk structural debris removal, and unauthorized boat missions are strictly reserved for Sri Lanka Armed Forces and specialized Disaster Management Centre (DMC) rescue units.
            </span>
          </div>
        </div>
      </header>

      {/* Operational Metrics Strip */}
      {stats && (
        <section
          aria-label="Operational task statistics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-300 rounded-xl p-4 shadow-xs"
        >
          <div className="p-3 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <ClipboardList size={15} />
              <span>Total Tasks</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {stats.totalTasks || 0}
            </p>
          </div>

          <div className="p-3 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <CheckCircle2 size={15} className="text-emerald-700" />
              <span>Open Opportunities</span>
            </div>
            <p className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
              {stats.openTasks || 0}
            </p>
          </div>

          <div className="p-3 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Users size={15} className="text-amber-700" />
              <span>Volunteers Required</span>
            </div>
            <p className="text-2xl font-bold text-amber-800 mt-1 tabular-nums">
              {stats.totalVolunteersRequired || 0}
            </p>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <ShieldCheck size={15} className="text-blue-700" />
              <span>Volunteers Deployed</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
              {stats.totalVolunteersAssigned || 0}
            </p>
          </div>
        </section>
      )}

      {/* View Switcher Tabs */}
      <nav
        aria-label="Task board views"
        className="flex items-center justify-between border-b border-slate-200 pb-2"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('explore')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'explore'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass size={15} />
            <span>Browse Opportunities</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => handleTabChange('my-applications')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'my-applications'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={15} />
              <span>My Applications</span>
              {myApplications.length > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.2 rounded font-bold tabular-nums ${
                    activeTab === 'my-applications'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-800'
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            <span>Post Task</span>
          </Link>
        )}
      </nav>

      {/* Tab 1: Explore Opportunities */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <TaskFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalCount={tasks.length}
          />

          {/* Task Feed */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-slate-600" />
              <p className="text-sm font-medium text-slate-600">
                Loading verified relief tasks...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 rounded-xl p-8 text-center space-y-3">
              <AlertTriangle size={32} className="text-red-700 mx-auto" />
              <h2 className="text-base font-bold text-red-950">
                Unable to load relief tasks
              </h2>
              <p className="text-xs text-red-800 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-300 p-12 text-center space-y-3">
              <Users size={36} className="text-slate-400 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">
                No relief tasks found matching your filters
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Adjust your district, category, or status selections, or reset the filters to see all available opportunities.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <section className="bg-white rounded-xl border border-slate-300 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Your Volunteer Applications &amp; Assignments
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Review your current task sign-ups and approved assignments. Once approved by a relief coordinator, report to the designated assembly point at the scheduled time.
            </p>

            {myApplications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Users size={32} className="text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800">
                  You have not applied for any relief tasks yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse tasks in your district and sign up to support displaced families.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('explore')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Browse open tasks
                </button>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-200">
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
                            className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors"
                          >
                            {task.title || 'Untitled Task'}
                          </Link>
                          <TaskStatusBadge status={app.status} type="application" />
                          {task.status && (
                            <TaskStatusBadge status={task.status} type="status" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span>
                            District: <span className="font-semibold text-slate-900">{task.district || 'Ampara'}</span>
                          </span>
                          <span>
                            Assembly Point: <span className="font-semibold text-slate-900">{task.location || 'On-Site'}</span>
                          </span>
                          {app.availability && (
                            <span>
                              Availability: <span className="font-semibold text-slate-900">{app.availability}</span>
                            </span>
                          )}
                        </div>

                        {app.reviewNotes && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-700">
                            <span className="font-semibold">Coordinator note: </span>
                            {app.reviewNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/tasks/${task._id || ''}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
