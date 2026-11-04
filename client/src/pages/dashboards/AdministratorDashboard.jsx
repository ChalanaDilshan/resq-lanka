import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  PackageCheck,
  Users,
  Bell,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  PlusCircle,
  ExternalLink,
  Phone,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchSOSRequests } from '../../services/sosService';
import { fetchShelterStats } from '../../services/shelterService';
import { fetchSupplyStats, fetchAllPledges } from '../../services/supplyService';
import { getTaskStats } from '../../services/taskService';
import { getNoticeStats } from '../../services/noticeService';
import VolunteerVettingQueue from '../../components/dashboard/VolunteerVettingQueue';

export default function AdministratorDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromQuery === 'volunteers' ? 'volunteers' : 'overview'
  );

  useEffect(() => {
    if (tabFromQuery === 'volunteers' || tabFromQuery === 'overview') {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'volunteers' ? { tab: 'volunteers' } : {});
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cross-module telemetry
  const [recentSOS, setRecentSOS] = useState([]);
  const [pendingSOSCount, setPendingSOSCount] = useState(0);
  const [criticalSOSCount, setCriticalSOSCount] = useState(0);

  const [shelterStats, setShelterStats] = useState(null);
  const [supplyStats, setSupplyStats] = useState(null);
  const [pendingPledges, setPendingPledges] = useState([]);

  const [taskStats, setTaskStats] = useState(null);
  const [noticeStats, setNoticeStats] = useState(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const [
          sosResult,
          shelterStatsResult,
          supplyStatsResult,
          pledgesResult,
          taskStatsResult,
          noticeStatsResult,
        ] = await Promise.allSettled([
          fetchSOSRequests(),
          fetchShelterStats(),
          fetchSupplyStats(),
          fetchAllPledges(),
          getTaskStats(),
          getNoticeStats(),
        ]);

        if (isCancelled) return;

        // 1. SOS Incidents
        if (sosResult.status === 'fulfilled' && Array.isArray(sosResult.value)) {
          const incidents = sosResult.value;
          setRecentSOS(incidents.slice(0, 5));
          setPendingSOSCount(incidents.filter((i) => i.status === 'Pending').length);
          setCriticalSOSCount(incidents.filter((i) => i.urgency === 'Critical').length);
        }

        // 2. Shelter Stats
        if (shelterStatsResult.status === 'fulfilled') {
          setShelterStats(shelterStatsResult.value);
        }

        // 3. Supply Stats & Pledges
        if (supplyStatsResult.status === 'fulfilled') {
          setSupplyStats(supplyStatsResult.value);
        }
        if (pledgesResult.status === 'fulfilled' && Array.isArray(pledgesResult.value)) {
          const pending = pledgesResult.value.filter((p) => p.status === 'Pledged');
          setPendingPledges(pending);
        }

        // 4. Task Stats
        if (taskStatsResult.status === 'fulfilled') {
          setTaskStats(taskStatsResult.value);
        }

        // 5. Notice Stats
        if (noticeStatsResult.status === 'fulfilled') {
          setNoticeStats(noticeStatsResult.value);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching admin dashboard telemetry:', err);
          setError('Failed to fetch cross-module operational telemetry.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadData();

    // Auto-poll live emergency incidents every 10 seconds for real-time dispatch
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [user, reloadTrigger]);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-50 text-red-900 border-red-300 font-bold';
      case 'High':
        return 'bg-orange-50 text-orange-900 border-orange-300 font-bold';
      case 'Medium':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      default:
        return 'bg-blue-50 text-blue-900 border-blue-300 font-semibold';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-amber-50 text-amber-800 border border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Authoritative Civic Operations Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                National Disaster Operations Center &bull; Live Telemetry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Operations Command &bull; {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Consolidated real-time disaster response overview across SOS dispatch, shelter capacities, relief inventory, volunteer task force, and official bulletins.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Updating...' : 'Live Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Primary Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => handleTabSelect('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Operations Command Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('volunteers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'volunteers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>Volunteer Vetting &amp; Review Queue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-700 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadTrigger((v) => v + 1)}
            className="font-bold underline hover:text-red-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'volunteers' ? (
        <VolunteerVettingQueue />
      ) : (
        <div className="space-y-6">
          {/* High-Contrast Operational Metric Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Mod 1: SOS Pending */}
            <Link
              to="/sos-dashboard"
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition group text-left"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                  SOS Pending
                </span>
                <ShieldAlert size={15} className="text-red-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{pendingSOSCount}</p>
              <p className="text-[11px] font-medium text-red-700 mt-0.5">
                {criticalSOSCount} critical urgency
              </p>
            </Link>

            {/* Mod 2: Shelter Vacancies */}
            <Link
              to="/shelters"
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition group text-left"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Shelter Vacancy
                </span>
                <Building2 size={15} className="text-emerald-700" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {shelterStats?.availableSpaces ?? '...'}
              </p>
              <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                {shelterStats?.totalShelters ?? 0} active shelters
              </p>
            </Link>

            {/* Mod 3: Supply Requests & Pledges */}
            <Link
              to="/coordinator"
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition group text-left"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Pledges to Verify
                </span>
                <PackageCheck size={15} className="text-teal-700" />
              </div>
              <p className="text-2xl font-black text-slate-900">{pendingPledges.length}</p>
              <p className="text-[11px] font-medium text-teal-700 mt-0.5">
                {supplyStats?.totalRequests ?? 0} requested items
              </p>
            </Link>

            {/* Mod 4: Volunteer Tasks */}
            <Link
              to="/tasks"
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition group text-left"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Open Tasks
                </span>
                <Users size={15} className="text-amber-700" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {taskStats?.openTasks ?? '...'}
              </p>
              <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                {taskStats?.availableSlots ?? 0} volunteers needed
              </p>
            </Link>

            {/* Mod 5: Active Notices */}
            <Link
              to="/alerts"
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition group text-left col-span-2 md:col-span-1"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Active Alerts
                </span>
                <Bell size={15} className="text-rose-700" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {noticeStats?.totalActive ?? '...'}
              </p>
              <p className="text-[11px] font-medium text-rose-700 mt-0.5">
                {noticeStats?.verifiedOfficialCount ?? 0} official bulletins
              </p>
            </Link>
          </div>

          {/* Two-Column Operational Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): SOS Incidents & Supplies Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Module 1: SOS Incidents Recent Feed */}
              <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        SOS Incident Response Queue
                      </h2>
                      <p className="text-xs text-slate-500">
                        Incoming community distress calls requiring dispatch or resolution
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/sos-dashboard"
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>Full Dispatch Console</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading incidents...</div>
                ) : recentSOS.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3">Hazard / Ref</th>
                          <th className="pb-3">Urgency</th>
                          <th className="pb-3">Location</th>
                          <th className="pb-3">Contact</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentSOS.map((inc) => (
                          <tr key={inc._id} className="hover:bg-slate-50 transition">
                            <td className="py-3 font-bold text-slate-900">
                              {inc.hazardType}
                              <span className="block text-[10px] font-medium text-slate-400">
                                #{inc._id.slice(-6).toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border ${getUrgencyBadge(
                                  inc.urgency
                                )}`}
                              >
                                {inc.urgency}
                              </span>
                            </td>
                            <td className="py-3 text-slate-600 max-w-[200px]">
                              <div className="truncate">{inc.locationText}</div>
                              {inc.coordinates?.lat && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${inc.coordinates.lat},${inc.coordinates.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-700 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                                >
                                  <span>Map Route</span>
                                  <ExternalLink size={9} />
                                </a>
                              )}
                            </td>
                            <td className="py-3 font-mono text-slate-800 text-[11px] whitespace-nowrap">
                              {inc.contactNumber?.includes('*') ? (
                                <span className="text-slate-400">{inc.contactNumber}</span>
                              ) : (
                                <a
                                  href={`tel:${inc.contactNumber}`}
                                  className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Phone size={10} />
                                  <span>{inc.contactNumber}</span>
                                </a>
                              )}
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(
                                  inc.status
                                )}`}
                              >
                                {inc.status}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-400 whitespace-nowrap">
                              {new Date(inc.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500 border border-slate-200">
                    No open emergency incidents in queue.
                  </div>
                )}
              </section>

              {/* Module 3: Relief Supplies & Pledges Summary */}
              <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                      <ClipboardList size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Relief Inventory &amp; Donor Pledges
                      </h2>
                      <p className="text-xs text-slate-500">
                        Distinction between pledged aid and physically received stock
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/coordinator"
                    className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Inventory</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {supplyStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Target Units</p>
                      <p className="text-lg font-black text-slate-900">{supplyStats.totalTargetUnits}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <p className="text-[10px] font-bold uppercase text-amber-800">Pledged Units</p>
                      <p className="text-lg font-black text-slate-900">{supplyStats.totalPledgedUnits}</p>
                      <p className="text-[10px] text-amber-800 font-semibold">{supplyStats.percentPledged}% Pledged</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <p className="text-[10px] font-bold uppercase text-emerald-800">Received Stock</p>
                      <p className="text-lg font-black text-slate-900">{supplyStats.totalReceivedUnits}</p>
                      <p className="text-[10px] text-emerald-800 font-semibold">{supplyStats.percentFulfilled}% In Stock</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <p className="text-[10px] font-bold uppercase text-blue-800">Pending Review</p>
                      <p className="text-lg font-black text-slate-900">{pendingPledges.length}</p>
                    </div>
                  </div>
                )}

                {/* Pending Pledges Awaiting Verification */}
                {pendingPledges.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Pledges Awaiting Verification:</p>
                    {pendingPledges.slice(0, 3).map((p) => (
                      <div
                        key={p._id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{p.itemName}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Donor: {p.donorName} &bull; {p.pledgedQuantity} {p.unit}
                          </span>
                        </div>
                        <Link
                          to="/coordinator"
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-teal-800 font-bold rounded-md text-xs shadow-2xs"
                        >
                          Verify
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">All registered donor pledges are verified.</p>
                )}
              </section>
            </div>

            {/* Right Column: Shelters, Tasks, Notices */}
            <div className="space-y-6">
              {/* Module 2: Shelter Capacity Snapshot */}
              <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-blue-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Shelter Capacity Status
                    </h3>
                  </div>
                  <Link to="/shelters" className="text-xs font-bold text-blue-700 hover:underline">
                    Shelter Board
                  </Link>
                </div>

                {shelterStats && (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Total Capacity</p>
                        <p className="text-[10px] text-slate-500">Across {shelterStats.totalShelters} centers</p>
                      </div>
                      <span className="text-base font-black text-slate-900">{shelterStats.totalCapacity}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-emerald-950">Available Vacancies</p>
                        <p className="text-[10px] text-emerald-800">Open beds for evacuees</p>
                      </div>
                      <span className="text-base font-black text-emerald-900">
                        {shelterStats.availableSpaces}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Occupancy Rate</p>
                        <p className="text-[10px] text-slate-500">National shelter load</p>
                      </div>
                      <span className="text-base font-black text-slate-900">
                        {shelterStats.overallOccupancyRate}%
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Module 4: Volunteer Operations Snapshot */}
              <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-amber-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Volunteer Task Force
                    </h3>
                  </div>
                  <Link
                    to="/tasks/new"
                    className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={12} />
                    <span>Post Task</span>
                  </Link>
                </div>

                {taskStats && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Tasks</p>
                        <p className="text-base font-black text-slate-900">{taskStats.totalTasks}</p>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-[10px] text-amber-800 font-bold uppercase">Open Tasks</p>
                        <p className="text-base font-black text-amber-900">{taskStats.openTasks}</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-600">Volunteers Required:</span>
                      <span className="font-extrabold text-slate-900">{taskStats.totalVolunteersRequired}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-600">Volunteers Assigned:</span>
                      <span className="font-extrabold text-slate-900">{taskStats.totalVolunteersAssigned}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTabSelect('volunteers')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <UserCheck size={13} />
                      <span>Review Volunteer Vetting Queue</span>
                    </button>
                  </div>
                )}
              </section>

              {/* Module 5: Emergency Notices Snapshot */}
              <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-rose-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Emergency Bulletins
                    </h3>
                  </div>
                  <Link
                    to="/alerts/new"
                    className="text-xs font-bold text-rose-800 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={12} />
                    <span>Post Alert</span>
                  </Link>
                </div>

                {noticeStats && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                      <span className="text-rose-950 font-bold">Critical Severity Alerts:</span>
                      <span className="font-black text-rose-900 text-sm">{noticeStats.criticalAlerts}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-slate-600">Districts Under Advisory:</span>
                      <span className="font-extrabold text-slate-900">{noticeStats.affectedDistrictsCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-slate-600">Verified Official Bulletins:</span>
                      <span className="font-extrabold text-emerald-800">{noticeStats.verifiedOfficialCount}</span>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
