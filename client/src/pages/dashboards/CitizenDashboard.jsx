import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  PackageCheck,
  Bell,
  ArrowRight,
  LifeBuoy,
  PhoneCall,
  Clock,
  MapPin,
  AlertTriangle,
  RefreshCw,
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
      {/* Top Welcome Banner & Primary Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Emergency Citizen Portal &bull; {user?.district || 'Sri Lanka'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ayubowan, {user?.name || 'Citizen'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              If you or your family are in immediate danger from flooding, landslides, or severe weather, submit an emergency SOS distress call now.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/sos"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldAlert size={18} className="stroke-[2.5]" />
              <span>Report Emergency SOS</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadTrigger((v) => v + 1);
              }}
              disabled={refreshing || loading}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Quick Module Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
          <Link
            to="/shelters"
            className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-2xl transition border border-white/10"
          >
            <div className="p-2 bg-blue-500/30 rounded-xl">
              <Building2 size={18} className="text-blue-200" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">Safe Shelters</p>
              <p className="text-[11px] text-blue-200">Directory &amp; high grounds</p>
            </div>
          </Link>

          <Link
            to="/supplies"
            className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-2xl transition border border-white/10"
          >
            <div className="p-2 bg-emerald-500/30 rounded-xl">
              <PackageCheck size={18} className="text-emerald-200" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">Relief Supplies</p>
              <p className="text-[11px] text-blue-200">Rations, water &amp; aid</p>
            </div>
          </Link>

          <Link
            to="/alerts"
            className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-2xl transition border border-white/10"
          >
            <div className="p-2 bg-rose-500/30 rounded-xl">
              <Bell size={18} className="text-rose-200" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">Disaster Alerts</p>
              <p className="text-[11px] text-blue-200">Official DMC bulletins</p>
            </div>
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

      {/* Grid: Left Column (My Reports & Shelters) / Right Column (Alerts & Supplies) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: My SOS Emergency Reports */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    My Emergency Reports
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incidents submitted through your authenticated session
                  </p>
                </div>
              </div>
              <Link
                to="/sos-dashboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Live Feed</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading your reports...</p>
              </div>
            ) : mySOSReports.length > 0 ? (
              <div className="space-y-3">
                {mySOSReports.map((report) => (
                  <div
                    key={report._id || report.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(
                              report.urgency
                            )}`}
                          >
                            {report.urgency}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {report.hazardType} Hazard
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{report.locationText}</span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                      <span>Ref: #{report._id ? report._id.slice(-6).toUpperCase() : 'INC'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-200/60 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                  <LifeBuoy size={20} />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No Active Distress Reports</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You have not submitted an emergency SOS request under this account. If you are experiencing a disaster hazard, report immediately.
                </p>
                <div className="pt-2">
                  <Link
                    to="/sos"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <ShieldAlert size={14} />
                    <span>Submit SOS Report</span>
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Section: Safe Shelter Availability */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Shelter Capacity &amp; Safe Havens
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified evacuation centers and assembly grounds
                  </p>
                </div>
              </div>
              <Link
                to="/shelters"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Shelter Metrics Chips */}
            {shelterStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Shelters</p>
                  <p className="text-lg font-black text-slate-800">{shelterStats.totalShelters}</p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Available Spaces</p>
                  <p className="text-lg font-black text-emerald-800">{shelterStats.availableSpaces}</p>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-blue-700">Flood High-Grounds</p>
                  <p className="text-lg font-black text-blue-800">{shelterStats.floodShelters || 0}</p>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-amber-700">Open Grounds</p>
                  <p className="text-lg font-black text-amber-800">{shelterStats.earthquakeShelters || 0}</p>
                </div>
              </div>
            )}

            {/* Top Shelters List */}
            <div className="space-y-3">
              {topShelters.map((shelter) => {
                const vacancy = Math.max(0, (shelter.capacityTotal || 0) - (shelter.capacityCurrent || 0));
                const pct =
                  shelter.capacityTotal > 0
                    ? Math.round(((shelter.capacityCurrent || 0) / shelter.capacityTotal) * 100)
                    : 0;

                return (
                  <div
                    key={shelter._id}
                    className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{shelter.name}</h4>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                          {shelter.district}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{shelter.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-700">
                          {vacancy} spaces open
                        </span>
                        <p className="text-[10px] text-slate-400">{pct}% Occupied</p>
                      </div>
                      <Link
                        to={`/shelters?id=${shelter._id}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
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

        {/* Right Column: Emergency Alerts & Supplies */}
        <div className="space-y-8">
          {/* Section: Official Alerts */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Active Disaster Alerts</h3>
              </div>
              <Link to="/alerts" className="text-xs font-bold text-rose-600 hover:underline">
                All Alerts
              </Link>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {new Date(alert.publishedAt || alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Source: {alert.sourceName}</span>
                      <Link
                        to={`/alerts/${alert._id}`}
                        className="text-rose-700 font-bold hover:underline"
                      >
                        Read Bulletin &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No active critical alerts published for your sector.
              </div>
            )}
          </section>

          {/* Section: Relief Supply Needs */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PackageCheck size={18} className="text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Community Aid Needs</h3>
              </div>
              <Link to="/supplies" className="text-xs font-bold text-blue-600 hover:underline">
                Donate
              </Link>
            </div>

            <div className="space-y-3">
              {neededSupplies.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {item.itemName}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {item.remainingQuantity} {item.unit} needed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Location: {item.shelterLocation}
                  </p>
                </div>
              ))}
            </div>

            {/* My Pledges Section if user has made donations */}
            {myPledges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">My Donor Pledges</h4>
                <div className="space-y-2">
                  {myPledges.map((p) => (
                    <div
                      key={p._id}
                      className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{p.itemName}</p>
                        <p className="text-[10px] text-slate-500">
                          {p.pledgedQuantity} {p.unit} &bull; {p.status}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section: Preparedness & Emergency Hotlines */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <PhoneCall size={18} className="text-red-400" />
              <h3 className="text-sm font-extrabold text-white">Emergency Disclosures</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ResQ-Lanka connects community volunteers, shelter coordinators, and local relief teams. For official state military/police rescue, dial:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">DMC Hotline</p>
                <p className="text-base text-red-400">117</p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Suwa Seriya Ambulance</p>
                <p className="text-base text-emerald-400">1990</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
