import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  PackageCheck,
  Bell,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Clock,
  MapPin,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchSOSRequests } from '../../services/sosService';
import { fetchShelters, fetchShelterStats } from '../../services/shelterService';
import { fetchSupplyItems, fetchAllPledges } from '../../services/supplyService';
import { getNotices } from '../../services/noticeService';

export default function CitizenDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [mySOSReports, setMySOSReports] = useState([]);
  const [shelterStats, setShelterStats] = useState(null);
  const [topShelters, setTopShelters] = useState([]);
  const [neededSupplies, setNeededSupplies] = useState([]);
  const [myPledges, setMyPledges] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const [allIncidents, sStats, sList, supplies, pledges, notices] =
          await Promise.allSettled([
            fetchSOSRequests(),
            fetchShelterStats(),
            fetchShelters(),
            fetchSupplyItems({ status: 'Partially Pledged' }),
            fetchAllPledges(),
            getNotices({ isOfficial: 'true' }),
          ]);

        if (isCancelled) return;

        // 1. My SOS Reports (filter by user ID or phone or email if logged in)
        if (allIncidents.status === 'fulfilled' && Array.isArray(allIncidents.value)) {
          if (user && (user.id || user._id)) {
            const currentUserId = (user.id || user._id).toString();
            const userPhone = user.phone ? user.phone.replace(/[\s-]+/g, '') : '';
            const filtered = allIncidents.value.filter((inc) => {
              const reportedById = inc.reportedBy ? (inc.reportedBy._id || inc.reportedBy).toString() : '';
              const incPhone = inc.contactNumber ? inc.contactNumber.replace(/[\s-]+/g, '') : '';
              return reportedById === currentUserId || (userPhone && incPhone === userPhone);
            });
            setMySOSReports(filtered);
          } else {
            setMySOSReports([]);
          }
        }

        // 2. Shelter availability
        if (sStats.status === 'fulfilled') {
          setShelterStats(sStats.value);
        }
        if (sList.status === 'fulfilled' && Array.isArray(sList.value)) {
          const openShelters = sList.value
            .filter((s) => s.status !== 'Closed')
            .slice(0, 3);
          setTopShelters(openShelters);
        }

        // 3. Relief supplies & citizen pledges
        if (supplies.status === 'fulfilled' && Array.isArray(supplies.value)) {
          setNeededSupplies(supplies.value.slice(0, 3));
        }
        if (pledges.status === 'fulfilled' && Array.isArray(pledges.value) && user?.email) {
          const userEmail = user.email.toLowerCase().trim();
          const userPledges = pledges.value.filter(
            (p) => p.donorEmail && p.donorEmail.toLowerCase() === userEmail
          );
          setMyPledges(userPledges);
        }

        // 4. Emergency alerts (active & published)
        if (notices.status === 'fulfilled' && Array.isArray(notices.value)) {
          const now = new Date();
          const published = notices.value.filter(
            (n) =>
              n.publicationStatus === 'Published' &&
              (!n.expiresAt || new Date(n.expiresAt) > now)
          );
          setActiveAlerts(published.slice(0, 3));
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading citizen dashboard data:', err);
          setError('Unable to fetch live relief telemetry. Please check server connection.');
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

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Medium':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'In Progress':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          CIVIC WELCOME BANNER & PRIMARY DISPATCH ACTION
         ========================================================================= */}
      <div className="bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-md text-xs font-medium text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Emergency Citizen Portal &bull; {user?.district || 'Sri Lanka'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ayubowan, {user?.name || 'Citizen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              If you or your family are in immediate danger from flooding, landslides, or severe weather, submit an emergency SOS distress call now.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/sos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-xs"
            >
              <ShieldAlert size={16} />
              <span>Report Emergency SOS</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HIGH-CONTRAST CIVIC UTILITY NAVIGATION TILES
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          to="/shelters"
          className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Building2 size={19} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
              Safe Shelters Directory
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Evacuation centers &amp; elevation ratings
            </p>
          </div>
        </Link>

        <Link
          to="/supplies"
          className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <PackageCheck size={19} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
              Relief Supply Board
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Food, drinking water &amp; medical needs
            </p>
          </div>
        </Link>

        <Link
          to="/alerts"
          className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Bell size={19} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
              Disaster Bulletins
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Official DMC alerts &amp; weather warnings
            </p>
          </div>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-700 shrink-0" />
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

      {/* =========================================================================
          MAIN TWO-COLUMN DASHBOARD GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION: MY SOS EMERGENCY REPORTS */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shrink-0">
                  <ShieldAlert size={17} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    My Emergency Reports
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incidents submitted through your authenticated session
                  </p>
                </div>
              </div>
              <Link
                to="/sos-dashboard"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition"
              >
                <span>Live Feed</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-7 h-7 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-500">Loading your reports...</p>
              </div>
            ) : mySOSReports.length > 0 ? (
              <div className="space-y-3">
                {mySOSReports.map((report) => (
                  <div
                    key={report._id || report.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getUrgencyBadge(
                              report.urgency
                            )}`}
                          >
                            {report.urgency}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {report.hazardType} Hazard
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin size={13} className="text-rose-600 shrink-0" />
                          <span>{report.locationText}</span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                      <span className="font-mono">Ref: #{report._id ? report._id.slice(-6).toUpperCase() : 'INC'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  No Active Distress Reports Logged
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  You have not submitted an emergency SOS request under this account. If you or someone in your vicinity is in danger, submit a verified emergency report.
                </p>
                <div className="pt-2">
                  <Link
                    to="/sos"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition shadow-xs"
                  >
                    <ShieldAlert size={14} />
                    <span>Submit SOS Report</span>
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* SECTION: SHELTER CAPACITY & SAFE HAVENS */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                  <Building2 size={17} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Shelter Capacity &amp; Safe Havens
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified evacuation centers and assembly grounds
                  </p>
                </div>
              </div>
              <Link
                to="/shelters"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Shelter Metrics Grid */}
            {shelterStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Shelters</p>
                  <p className="text-lg font-bold text-slate-900">{shelterStats.totalShelters}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Available Spaces</p>
                  <p className="text-lg font-bold text-emerald-800">{shelterStats.availableSpaces}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Flood High-Grounds</p>
                  <p className="text-lg font-bold text-slate-900">{shelterStats.floodShelters || 0}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Open Grounds</p>
                  <p className="text-lg font-bold text-slate-900">{shelterStats.earthquakeShelters || 0}</p>
                </div>
              </div>
            )}

            {/* Top Shelters List */}
            <div className="space-y-2.5">
              {topShelters.map((shelter) => {
                const vacancy = Math.max(0, (shelter.capacityTotal || 0) - (shelter.capacityCurrent || 0));
                const pct =
                  shelter.capacityTotal > 0
                    ? Math.round(((shelter.capacityCurrent || 0) / shelter.capacityTotal) * 100)
                    : 0;

                return (
                  <div
                    key={shelter._id}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{shelter.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300">
                          {shelter.district}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <MapPin size={12} className="text-rose-600 shrink-0" />
                        <span>{shelter.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800">
                          {vacancy} spaces open
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">{pct}% Occupied</p>
                      </div>
                      <Link
                        to={`/shelters?id=${shelter._id}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-md transition shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* SECTION: ACTIVE DISASTER ALERTS */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Disaster Alerts</h3>
              </div>
              <Link to="/alerts" className="text-xs font-semibold text-rose-700 hover:underline">
                All Alerts
              </Link>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-2.5">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-rose-100 text-rose-950 border border-rose-200 rounded">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {new Date(alert.publishedAt || alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Source: {alert.sourceName}</span>
                      <Link
                        to={`/alerts/${alert._id}`}
                        className="text-rose-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Read Bulletin</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                No active critical alerts published for your sector.
              </div>
            )}
          </section>

          {/* SECTION: COMMUNITY RELIEF NEEDS */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PackageCheck size={16} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Community Aid Needs</h3>
              </div>
              <Link to="/supplies" className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline">
                Donate
              </Link>
            </div>

            <div className="space-y-2.5">
              {neededSupplies.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {item.itemName}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                      {item.remainingQuantity} {item.unit} needed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Facility: {item.shelterLocation}
                  </p>
                </div>
              ))}
            </div>

            {/* My Pledges Section if user has made donations */}
            {myPledges.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">My Donor Pledges</h4>
                <div className="space-y-2">
                  {myPledges.map((p) => (
                    <div
                      key={p._id}
                      className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{p.itemName}</p>
                        <p className="text-[10px] text-slate-500">
                          {p.pledgedQuantity} {p.unit} &bull; {p.status}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION: EMERGENCY DISCLOSURES & HOTLINES */}
          <section className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall size={16} className="text-rose-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Emergency Hotlines &amp; State Rescue</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ResQ-Lanka connects community volunteers, shelter coordinators, and local relief teams. For official state military/police rescue, dial:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">DMC Hotline</p>
                <p className="text-base font-bold text-red-400">117</p>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Suwa Seriya</p>
                <p className="text-base font-bold text-emerald-400">1990</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
