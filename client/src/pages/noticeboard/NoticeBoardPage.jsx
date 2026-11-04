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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 24/7 Sri Lanka Emergency Hotlines Bar */}
      <EmergencyHotlineBar />

      {/* Hero & Status Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>DMC Emergency Operations • National Public Warning System</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Emergency Alerts &amp; Noticeboard
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Official disaster warnings from the Disaster Management Centre (DMC), Department of Meteorology,
                and verified community emergency notices across Sri Lanka.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadNotices}
                disabled={isLoading}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Feed</span>
              </button>

              <Link
                to="/alerts/new"
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-md text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Alert / Notice</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Noticeboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-10 w-full space-y-5 flex-grow pb-16">
        {/* Aggregate Stats Strip */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 grid grid-cols-2 sm:grid-cols-4">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Active Advisories</span>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.totalActive ?? notices.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Live emergency notices</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Critical Red Alerts</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-700 tracking-tight">
              {stats?.criticalAlerts ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Immediate danger warnings</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Official Bulletins</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.verifiedOfficialCount ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">DMC, Met Dept, NBRO</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Impacted Districts</span>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.affectedDistrictsCount ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Provincial areas affected</div>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-3.5 bg-slate-900 text-white border border-slate-800 rounded-lg text-xs font-medium flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-slate-400 hover:text-white"
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
              <div key={i} className="h-56 bg-slate-200/70 rounded-xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Alert Feed Unavailable</h3>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadNotices}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notices.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <Radio className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No Emergency Alerts Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                There are currently no active alerts matching your search criteria. Try selecting different districts or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Notices Cards Grid */}
        {!isLoading && !error && notices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
