import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Flame,
  MapPin,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getNotices,
  getNoticeStats,
  verifyNoticeSource,
  withdrawNotice,
} from '../../services/noticeService';
import EmergencyHotlineBar from '../../components/mod5-noticeboard/EmergencyHotlineBar';
import NoticeFilterBar from '../../components/mod5-noticeboard/NoticeFilterBar';
import NoticeCard from '../../components/mod5-noticeboard/NoticeCard';
import NoticeVerificationModal from '../../components/mod5-noticeboard/NoticeVerificationModal';
import NoticeWithdrawModal from '../../components/mod5-noticeboard/NoticeWithdrawModal';

export default function NoticeBoardPage() {
  const { user, activeRole } = useAuth();
  const [searchParams] = useSearchParams();

  const isAdmin =
    activeRole === 'administrator' ||
    activeRole === 'coordinator' ||
    user?.role === 'administrator' ||
    user?.role === 'coordinator';

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    hazardType: searchParams.get('hazardType') || 'All',
    severity: searchParams.get('severity') || 'All',
    district: searchParams.get('district') || 'All',
    isOfficial: searchParams.get('isOfficial') === 'true',
    tab: searchParams.get('tab') || 'active', // 'active' | 'official' | 'archive'
  });

  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for admin actions
  const [verifyModalNotice, setVerifyModalNotice] = useState(null);
  const [withdrawModalNotice, setWithdrawModalNotice] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch notices helper
  const loadNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.hazardType !== 'All') queryParams.hazardType = filters.hazardType;
      if (filters.severity !== 'All') queryParams.severity = filters.severity;
      if (filters.district !== 'All') queryParams.district = filters.district;
      if (filters.isOfficial) queryParams.isOfficial = 'true';

      if (filters.tab === 'archive') {
        queryParams.includeExpired = 'true';
      }

      const [noticesData, statsData] = await Promise.all([
        getNotices(queryParams),
        getNoticeStats(),
      ]);

      setNotices(noticesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load notices:', err);
      setError('Unable to fetch live emergency notices. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const queryParams = {};
        if (filters.search) queryParams.search = filters.search;
        if (filters.hazardType !== 'All') queryParams.hazardType = filters.hazardType;
        if (filters.severity !== 'All') queryParams.severity = filters.severity;
        if (filters.district !== 'All') queryParams.district = filters.district;
        if (filters.isOfficial) queryParams.isOfficial = 'true';

        if (filters.tab === 'archive') {
          queryParams.includeExpired = 'true';
        }

        const [noticesData, statsData] = await Promise.all([
          getNotices(queryParams),
          getNoticeStats(),
        ]);

        if (!ignore) {
          setNotices(noticesData);
          setStats(statsData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load notices:', err);
          setError('Unable to fetch live emergency notices. Please retry.');
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      hazardType: 'All',
      severity: 'All',
      district: 'All',
      isOfficial: false,
      tab: 'active',
    });
  };

  // Admin Verification
  const handleVerifyConfirm = async (verificationData) => {
    if (!verifyModalNotice) return;
    await verifyNoticeSource(verifyModalNotice._id, verificationData);
    setActionSuccess(`Notice source verified successfully.`);
    setTimeout(() => setActionSuccess(null), 4000);
    loadNotices();
  };

  // Admin Withdrawal
  const handleWithdrawConfirm = async (reason) => {
    if (!withdrawModalNotice) return;
    await withdrawNotice(withdrawModalNotice._id, reason);
    setActionSuccess(`Alert successfully withdrawn from active feed.`);
    setTimeout(() => setActionSuccess(null), 4000);
    loadNotices();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* 24/7 Sri Lanka Emergency Hotlines Bar */}
      <EmergencyHotlineBar />

      {/* Hero & Status Banner */}
      <section className="bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-slate-900/60 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Live Emergency Broadcast</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Emergency Alerts &amp; Noticeboard
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Official disaster warnings from the Disaster Management Centre (DMC), Department of Meteorology, and verified community emergency notices across Sri Lanka.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={loadNotices}
                disabled={isLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Live Alerts</span>
              </button>

              <Link
                to="/alerts/new"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Post Alert / Notice</span>
              </Link>
            </div>
          </div>

          {/* Aggregate Stats Ticker */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stats?.totalActive ?? notices.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Alerts
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Flame className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stats?.criticalAlerts ?? 0}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Critical Red Alerts
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stats?.verifiedOfficialCount ?? 0}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Official Agencies
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stats?.affectedDistrictsCount ?? 0}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Impacted Districts
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Noticeboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-grow">
        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <NoticeFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={notices.length}
        />

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-sm space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">Alert Feed Unavailable</h3>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadNotices}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notices.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Radio className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Emergency Alerts Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                There are currently no active alerts matching your search criteria. Try selecting different districts or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Notices Cards Grid */}
        {!isLoading && !error && notices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((notice) => (
              <NoticeCard
                key={notice._id}
                notice={notice}
                isAdmin={isAdmin}
                onVerify={(n) => setVerifyModalNotice(n)}
                onWithdraw={(n) => setWithdrawModalNotice(n)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Admin Action Modals */}
      {verifyModalNotice && (
        <NoticeVerificationModal
          notice={verifyModalNotice}
          isOpen={Boolean(verifyModalNotice)}
          onClose={() => setVerifyModalNotice(null)}
          onConfirm={handleVerifyConfirm}
        />
      )}

      {withdrawModalNotice && (
        <NoticeWithdrawModal
          notice={withdrawModalNotice}
          isOpen={Boolean(withdrawModalNotice)}
          onClose={() => setWithdrawModalNotice(null)}
          onConfirm={handleWithdrawConfirm}
        />
      )}
    </div>
  );
}
