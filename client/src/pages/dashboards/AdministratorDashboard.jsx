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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Telemetry across the 5 modules
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Operations Command &bull; Multi-Module Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ayubowan, {user?.name || 'Administrator'} &bull; Operations Command
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Consolidated real-time disaster response overview across SOS dispatch, shelter capacities, relief inventory, volunteer tasks, and official notices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition flex items-center gap-2 shadow-xs"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Operational Overview KPI Cards across the 5 Modules */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6 mt-6 border-t border-white/15">
          {/* Mod 1: SOS Incidents */}
          <Link
            to="/sos-dashboard"
            className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl border border-white/10 transition group text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-red-300">SOS Pending</span>
              <ShieldAlert size={14} className="text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-white">{pendingSOSCount}</p>
            <p className="text-[10px] text-red-200 mt-1">{criticalSOSCount} critical urgency</p>
          </Link>

          {/* Mod 2: Shelter Capacity */}
          <Link
            to="/shelters"
            className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl border border-white/10 transition group text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-emerald-300">Shelter Vacancy</span>
              <Building2 size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-white">
              {shelterStats?.availableSpaces ?? '...'}
            </p>
            <p className="text-[10px] text-emerald-200 mt-1">
              {shelterStats?.totalShelters ?? 0} active shelters
            </p>
          </Link>

          {/* Mod 3: Supply Requests & Pledges */}
          <Link
            to="/coordinator"
            className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl border border-white/10 transition group text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-teal-300">Pledges to Verify</span>
              <PackageCheck size={14} className="text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-white">{pendingPledges.length}</p>
            <p className="text-[10px] text-teal-200 mt-1">
              {supplyStats?.totalRequests ?? 0} requested items
            </p>
          </Link>

          {/* Mod 4: Volunteer Tasks */}
          <Link
            to="/tasks"
            className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl border border-white/10 transition group text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-amber-300">Open Tasks</span>
              <Users size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-white">{taskStats?.openTasks ?? '...'}</p>
            <p className="text-[10px] text-amber-200 mt-1">
              {taskStats?.availableSlots ?? 0} volunteers needed
            </p>
          </Link>

          {/* Mod 5: Active Notices */}
          <Link
            to="/alerts"
            className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl border border-white/10 transition group text-left col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-rose-300">Active Alerts</span>
              <Bell size={14} className="text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-white">{noticeStats?.totalActive ?? '...'}</p>
            <p className="text-[10px] text-rose-200 mt-1">
              {noticeStats?.verifiedOfficialCount ?? 0} official bulletins
            </p>
          </Link>
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): SOS Incidents & Supplies Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Module 1: SOS Incidents Recent Feed */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    SOS Incident Response Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incoming community distress calls requiring dispatch or resolution
                  </p>
                </div>
              </div>
              <Link
                to="/sos-dashboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(
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
                            <a href={`tel:${inc.contactNumber}`} className="text-blue-700 font-bold hover:underline flex items-center gap-1">
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
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No open emergency incidents in queue.
              </div>
            )}
          </section>

          {/* Module 3: Relief Supplies & Pledges Summary */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Relief Inventory &amp; Donor Pledges
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distinction between pledged aid and physically received stock
                  </p>
                </div>
              </div>
              <Link
                to="/coordinator"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Manage Inventory</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {supplyStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Target Units</p>
                  <p className="text-lg font-black text-slate-800">{supplyStats.totalTargetUnits}</p>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-amber-700">Pledged Units</p>
                  <p className="text-lg font-black text-amber-800">{supplyStats.totalPledgedUnits}</p>
                  <p className="text-[10px] text-amber-600 font-semibold">{supplyStats.percentPledged}% Pledged</p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Received Stock</p>
                  <p className="text-lg font-black text-emerald-800">{supplyStats.totalReceivedUnits}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">{supplyStats.percentFulfilled}% In Stock</p>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-blue-700">Pending Review</p>
                  <p className="text-lg font-black text-blue-800">{pendingPledges.length}</p>
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
                    className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{p.itemName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Donor: {p.donorName} &bull; {p.pledgedQuantity} {p.unit}
                      </span>
                    </div>
                    <Link
                      to="/coordinator"
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-teal-700 font-bold rounded-lg text-xs"
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
        <div className="space-y-8">
          {/* Module 2: Shelter Capacity Snapshot */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Shelter Status Summary</h3>
              </div>
              <Link to="/shelters" className="text-xs font-bold text-blue-600 hover:underline">
                Shelter Board
              </Link>
            </div>

            {shelterStats && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Total Capacity</p>
                    <p className="text-[11px] text-slate-500">Across {shelterStats.totalShelters} centers</p>
                  </div>
                  <span className="text-base font-black text-slate-900">{shelterStats.totalCapacity}</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl flex items-center justify-between border border-emerald-100">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Available Vacancies</p>
                    <p className="text-[11px] text-emerald-700">Currently open for evacuees</p>
                  </div>
                  <span className="text-base font-black text-emerald-800">
                    {shelterStats.availableSpaces}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Occupancy Rate</p>
                    <p className="text-[11px] text-slate-500">National shelter load</p>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    {shelterStats.overallOccupancyRate}%
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Module 4: Volunteer Tasks Snapshot */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Volunteer Operations</h3>
              </div>
              <Link to="/tasks/new" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                <PlusCircle size={13} />
                <span>Post Task</span>
              </Link>
            </div>

            {taskStats && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Tasks</p>
                    <p className="text-base font-black text-slate-800">{taskStats.totalTasks}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-[10px] text-amber-700 font-bold uppercase">Open Tasks</p>
                    <p className="text-base font-black text-amber-800">{taskStats.openTasks}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600">Volunteers Required:</span>
                  <span className="font-extrabold text-slate-800">{taskStats.totalVolunteersRequired}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600">Volunteers Assigned:</span>
                  <span className="font-extrabold text-slate-800">{taskStats.totalVolunteersAssigned}</span>
                </div>
              </div>
            )}
          </section>

          {/* Module 5: Emergency Notices Snapshot */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Emergency Alerts</h3>
              </div>
              <Link to="/alerts/new" className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1">
                <PlusCircle size={13} />
                <span>Post Alert</span>
              </Link>
            </div>

            {noticeStats && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between">
                  <span className="text-rose-900 font-bold">Critical Severity Alerts:</span>
                  <span className="font-black text-rose-800 text-sm">{noticeStats.criticalAlerts}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Districts Under Advisory:</span>
                  <span className="font-extrabold text-slate-800">{noticeStats.affectedDistrictsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Verified Official Alerts:</span>
                  <span className="font-extrabold text-emerald-700">{noticeStats.verifiedOfficialCount}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
