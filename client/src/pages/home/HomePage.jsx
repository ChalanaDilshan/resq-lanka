import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Users,
  Search,
  ArrowRight,
  ChevronRight,
  Phone,
  ShieldCheck,
  Activity,
  HeartHandshake,
  PackageCheck,
  X,
  CheckCircle2,
  Navigation,
  ExternalLink,
} from 'lucide-react';

import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';
import shelterAmpara from '../../assets/shelter_ampara.jpg';
import shelterAkkaraipattu from '../../assets/shelter_akkaraipattu.jpg';
import shelterKalmunai from '../../assets/shelter_kalmunai.jpg';
import { fetchSOSRequests } from '../../services/sosService';
import { fetchShelters, fetchShelterStats } from '../../services/shelterService';
import { getNotices } from '../../services/noticeService';
import { fetchSupplyItems, fetchSupplyStats } from '../../services/supplyService';
import { getTasks, getTaskStats } from '../../services/taskService';
import { formatTimeAgo } from '../../utils/timeAgo';

// Helper to determine shelter image
const getShelterImage = (shelter) => {
  if (shelter?.image) return shelter.image;
  const n = (shelter?.name || '').toLowerCase();
  if (n.includes('ampara')) return shelterAmpara;
  if (n.includes('akkaraipattu')) return shelterAkkaraipattu;
  if (n.includes('kalmunai')) return shelterKalmunai;
  return shelter?.hazardType === 'earthquake' ? shelterAkkaraipattu : shelterAmpara;
};

// Helper for alert severity badge colors
const getSeverityBadgeColor = (severity) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return 'bg-red-600';
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-red-500';
  }
};

export default function HomePage() {
  const navigate = useNavigate();

  // Dynamic filter state for Shelters
  const [shelterFilter, setShelterFilter] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);

  // Live operational telemetry across all 5 modules
  const [shelters, setShelters] = useState([]);
  const [shelterStats, setShelterStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [neededSupplies, setNeededSupplies] = useState([]);
  const [supplyStats, setSupplyStats] = useState(null);
  const [openTasks, setOpenTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [liveSosCount, setLiveSosCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load real telemetry and datasets across all 5 disaster response modules
  useEffect(() => {
    let isMounted = true;

    const loadRealData = async () => {
      try {
        const [
          sheltersRes,
          shelterStatsRes,
          noticesRes,
          suppliesRes,
          supplyStatsRes,
          tasksRes,
          taskStatsRes,
          sosRes,
        ] = await Promise.allSettled([
          fetchShelters(),
          fetchShelterStats(),
          getNotices(),
          fetchSupplyItems({ status: 'Open' }),
          fetchSupplyStats(),
          getTasks({ status: 'Open' }),
          getTaskStats(),
          fetchSOSRequests(),
        ]);

        if (!isMounted) return;

        if (sheltersRes.status === 'fulfilled' && Array.isArray(sheltersRes.value)) {
          setShelters(sheltersRes.value);
        }
        if (shelterStatsRes.status === 'fulfilled') {
          setShelterStats(shelterStatsRes.value);
        }
        if (noticesRes.status === 'fulfilled' && Array.isArray(noticesRes.value)) {
          setNotices(noticesRes.value);
        }
        if (suppliesRes.status === 'fulfilled' && Array.isArray(suppliesRes.value)) {
          setNeededSupplies(suppliesRes.value.slice(0, 4));
        }
        if (supplyStatsRes.status === 'fulfilled') {
          setSupplyStats(supplyStatsRes.value);
        }
        if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)) {
          setOpenTasks(tasksRes.value.slice(0, 3));
        }
        if (taskStatsRes.status === 'fulfilled') {
          setTaskStats(taskStatsRes.value);
        }
        if (sosRes.status === 'fulfilled' && Array.isArray(sosRes.value)) {
          setLiveSosCount(sosRes.value.length);
        }
      } catch (err) {
        console.warn('Operational data load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRealData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter real shelters according to category and search
  const filteredShelters = shelters.filter((s) => {
    const isFlood = s.hazardType === 'flood';
    const isEarthquake = s.hazardType === 'earthquake';

    const matchesCategory =
      shelterFilter === 'All' ||
      (shelterFilter === 'Flood (High-Ground)' && isFlood) ||
      (shelterFilter === 'Earthquake (Open Ground)' && isEarthquake);

    const q = searchLocation.trim().toLowerCase();
    const loc = (s.district || s.address || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    const matchesSearch = q === '' || loc.includes(q) || name.includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-red-500 selection:text-white">
      {/* =========================================================================
          HERO SECTION
          Disaster Landscape, Overlay, Title, Subtitle, Dual CTAs
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white">
        {/* Background Disaster Imagery with Dark Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${heroDisasterBg})` }}
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-slate-950/85" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-slate-950/95" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-20 sm:pb-28 text-center flex flex-col items-center">
          {/* Tracking Subtitle Pill */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 drop-shadow">
              Community Disaster Response & Relief Coordination System
            </span>
          </div>

          {/* Main Title: ResQ-Lanka */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tight leading-none drop-shadow-lg">
            <span className="text-white">ResQ</span>
            <span className="text-[#ef4444]">-Lanka</span>
          </h1>

          {/* Strong Catchphrase */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3 sm:mt-4 drop-shadow">
            Stronger Communities. Safer Lives.
          </p>

          {/* Subtext Description */}
          <p className="text-slate-200/95 text-sm sm:text-base md:text-[17px] font-normal max-w-2xl sm:max-w-3xl leading-relaxed mt-4 drop-shadow">
            A unified platform for emergency reporting, safe shelters, relief donations and volunteer coordination
            during floods, earthquakes and other natural disasters in Sri Lanka.
          </p>

          {/* Dual Call to Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary Button: Report Emergency */}
            <Link
              to="/sos"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-[#ef4444] hover:bg-red-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-xl shadow-red-600/35 flex items-center justify-center gap-2.5 transition-all group"
            >
              <AlertTriangle size={18} className="stroke-[2.6]" />
              <span>Report an Emergency</span>
              <ArrowRight size={18} className="stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Secondary Button: Find Safe Shelters */}
            <a
              href="#shelters"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('shelters')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#1d4ed8] font-bold rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center gap-2.5 transition-all group"
            >
              <MapPin size={18} className="stroke-[2.6] text-[#1d4ed8]" />
              <span>Find Safe Shelters</span>
              <ArrowRight size={18} className="stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR QUICK ACTION CARDS
          Overlapping layout matching screenshot exactly
         ========================================================================= */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Report Emergency */}
          <Link
            to="/sos"
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-red-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ef4444] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              {/* Siren SVG */}
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4.56 5 7.42 5 11V15L3 17V18H21V17L19 15V11C19 7.42 16.31 4.56 13 4V3C13 2.45 12.55 2 12 2ZM9 19C9 20.66 10.34 22 12 22C13.66 22 15 20.66 15 19H9Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                Report Emergency
              </h3>
              <p className="text-xs text-slate-500 leading-snug mt-1">
                Submit an SOS request if you or someone you know needs urgent assistance.
              </p>
            </div>
          </Link>

          {/* Card 2: Find Safe Shelters */}
          <Link
            to="/shelters"
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Find Safe Shelters
              </h3>
              <p className="text-xs text-slate-500 leading-snug mt-1">
                View verified directory categorized by flood & earthquake hazards.
              </p>
            </div>
          </Link>

          {/* Card 3: Support with Donations */}
          <div
            onClick={() => setDonationModalOpen(true)}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-emerald-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2 6.89 2 8V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM13 15H11V18H9V15H7V13H9V10H11V13H13V15Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Support with Donations
              </h3>
              <p className="text-xs text-slate-500 leading-snug mt-1">
                See urgent supply needs and make a pledge to help affected communities.
              </p>
            </div>
          </div>

          {/* Card 4: Join as a Volunteer */}
          <div
            onClick={() => setVolunteerModalOpen(true)}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-amber-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Join as a Volunteer
              </h3>
              <p className="text-xs text-slate-500 leading-snug mt-1">
                Browse and claim community tasks to support disaster relief efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LOWER SECTION (3 COLUMNS)
          Col 1: Latest Emergency Alerts
          Col 2: Find Nearby Shelters
          Col 3: Impact at a Glance
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* -------------------------------------------------------------------
              COLUMN 1: LATEST EMERGENCY ALERTS (lg:col-span-4)
             ------------------------------------------------------------------- */}
          <div
            id="alerts"
            className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500 stroke-[2.5]" />
                <h2 className="text-lg font-bold text-slate-900">Latest Emergency Alerts</h2>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors font-bold"
              >
                <span>Full Noticeboard</span>
                <ArrowRight size={14} className="stroke-[2.2]" />
              </Link>
            </div>

            {/* Alerts List */}
            <div className="space-y-3.5">
              {notices.length > 0 ? (
                notices.slice(0, 3).map((alert) => (
                  <div
                    key={alert._id || alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="group p-4 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-300 rounded-2xl transition-all duration-200 cursor-pointer relative shadow-xs"
                  >
                    {/* Top Row: Badge, Title & Timestamp */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-wider ${getSeverityBadgeColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {alert.title}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 ml-auto flex-shrink-0">
                        {formatTimeAgo(alert.publishedAt)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed pr-6 line-clamp-2">
                      {alert.message || alert.description}
                    </p>

                    {/* Right Arrow */}
                    <div className="absolute right-3.5 bottom-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight size={16} className="stroke-[2.2]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                  {isLoading ? 'Checking for active emergency alerts...' : 'No active critical alerts in monitored sectors.'}
                </div>
              )}
            </div>

            {/* DMC Endorsement */}
            <div className="mt-2 p-3 bg-red-50/70 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <ShieldCheck size={16} className="stroke-[2.2] flex-shrink-0 text-red-600" />
              <span>Official warnings issued in partnership with Disaster Management Centre (DMC).</span>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              COLUMN 2: FIND NEARBY SHELTERS (lg:col-span-5)
             ------------------------------------------------------------------- */}
          <div
            id="shelters"
            className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-blue-600 stroke-[2.5]" />
                <h2 className="text-lg font-bold text-slate-900">Find Nearby Shelters</h2>
              </div>
              <Link
                to="/shelters"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors font-bold"
              >
                <span>Full Directory</span>
                <ArrowRight size={14} className="stroke-[2.2]" />
              </Link>
            </div>

            {/* Search Input Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="shelter-search-input"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter your location (e.g. Ampara)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <button
                type="button"
                className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm"
              >
                Search
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Flood (High-Ground)', 'Earthquake (Open Ground)'].map((cat) => {
                const isActive = shelterFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setShelterFilter(cat)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Shelters Cards (Grid of 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredShelters.length > 0 ? (
                filteredShelters.slice(0, 3).map((shelter) => (
                  <div
                    key={shelter._id || shelter.id}
                    onClick={() => setSelectedShelter(shelter)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md overflow-hidden transition-all duration-200 cursor-pointer flex flex-col"
                  >
                    {/* Shelter Photo */}
                    <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getShelterImage(shelter)}
                        alt={shelter.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-2.5 flex flex-col flex-grow">
                      <h4 className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                        {shelter.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        {shelter.hazardCategoryLabel ||
                          (shelter.hazardType === 'flood'
                            ? 'High-Ground Shelter'
                            : 'Open Assembly Ground')}
                      </p>

                      {/* Capacity Pill */}
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100">
                          <Users size={11} className="stroke-[2.2]" />
                          <span>
                            {shelter.capacityCurrent} / {shelter.capacityTotal} occupied
                          </span>
                        </span>
                      </div>

                      {/* Location */}
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{shelter.district || shelter.address || 'Sri Lanka'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center text-slate-400 text-xs">
                  {isLoading
                    ? 'Loading verified shelters...'
                    : `No shelters found matching "${searchLocation}". Try searching another area.`}
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------------
              COLUMN 3: IMPACT AT A GLANCE (lg:col-span-3)
             ------------------------------------------------------------------- */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-blue-600 stroke-[2.5]" />
              <h2 className="text-lg font-bold text-slate-900">Impact at a Glance</h2>
            </div>

            {/* Stat Row 1: Emergency Requests */}
            <Link
              to="/sos-dashboard"
              className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-red-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                    <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4.56 5 7.42 5 11V15L3 17V18H21V17L19 15V11C19 7.42 16.31 4.56 13 4V3C13 2.45 12.55 2 12 2ZM9 19C9 20.66 10.34 22 12 22C13.66 22 15 20.66 15 19H9Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-red-600 leading-none">
                    {liveSosCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Emergency Requests
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Stat Row 2: Active Shelters */}
            <Link
              to="/shelters"
              className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-blue-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
                    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-blue-600 leading-none">
                    {shelterStats?.totalShelters ?? (shelters.length || 10)}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Active Shelters
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Stat Row 3: Urgent Supply Needs */}
            <div
              onClick={() => setDonationModalOpen(true)}
              className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-emerald-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2 6.89 2 8V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM13 15H11V18H9V15H7V13H9V10H11V13H13V15Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-600 leading-none">
                    {supplyStats?.totalRequests ?? (neededSupplies.length || 12)}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Urgent Supply Needs
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Stat Row 4: Registered Volunteers */}
            <div
              onClick={() => setVolunteerModalOpen(true)}
              className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-amber-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-amber-500" viewBox="0 0 24 24">
                    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-amber-500 leading-none">
                    {taskStats?.totalVolunteersAssigned ?? (taskStats?.totalTasks ?? openTasks.length)}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Registered Volunteers
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NATIONAL EMERGENCY HOTLINES STRIP
         ========================================================================= */}
      <section className="bg-slate-900 text-white py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-base font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <Phone size={18} className="text-red-500" />
                <span>Sri Lanka 24/7 National Emergency Contacts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Toll-free emergency helplines for immediate disaster response and medical rescue
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {[
                { name: 'Disaster Management (DMC)', number: '117', color: 'text-red-400' },
                { name: 'Suwa Seriya Ambulance', number: '1990', color: 'text-sky-400' },
                { name: 'Police Emergency', number: '119', color: 'text-amber-400' },
                { name: 'Sri Lanka Red Cross', number: '011-2670002', color: 'text-emerald-400' },
              ].map((h) => (
                <a
                  key={h.name}
                  href={`tel:${h.number.replace(/-/g, '')}`}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center transition"
                >
                  <div className={`text-base font-black ${h.color}`}>{h.number}</div>
                  <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{h.name}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer id="about" className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">ResQ</span>
                <span className="text-lg font-black text-red-500">-Lanka</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A unified emergency response ecosystem built to support community resilience, rapid SOS dispatch, safe sheltering, and relief logistics across Sri Lanka.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-300">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Verified Community Network</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/sos" className="hover:text-white transition">Report SOS Request</Link></li>
                <li><Link to="/sos-dashboard" className="hover:text-white transition">Live Incident Dashboard</Link></li>
                <li><a href="#shelters" className="hover:text-white transition">Shelter Directory</a></li>
                <li><a href="#alerts" className="hover:text-white transition">Weather & Geological Alerts</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Disaster Readiness</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#alerts" className="hover:text-white transition">Flood Evacuation Routes</a></li>
                <li><a href="#alerts" className="hover:text-white transition">Earthquake Assembly Grounds</a></li>
                <li><span className="hover:text-white transition cursor-pointer" onClick={() => setDonationModalOpen(true)}>Urgent Relief Supplies</span></li>
                <li><span className="hover:text-white transition cursor-pointer" onClick={() => setVolunteerModalOpen(true)}>Volunteer Brigade</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Together for Sri Lanka</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Developed in coordination with regional first responders, volunteers, and public sector relief organizations.
              </p>
              <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                📍 National Command Center: Colombo 07, Sri Lanka
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 ResQ-Lanka. Together for a Safer Sri Lanka. All Rights Reserved.</p>
            <p className="text-[11px] text-slate-500">Built with React 19, Tailwind CSS & Vite</p>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS & INTERACTIVE POPUPS
         ========================================================================= */}

      {/* Shelter Detail Modal */}
      {selectedShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative">
            <button
              type="button"
              onClick={() => setSelectedShelter(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            >
              <X size={18} />
            </button>

            {/* Photo Header */}
            <div className="relative h-44 w-full">
              <img
                src={getShelterImage(selectedShelter)}
                alt={selectedShelter.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-600 rounded">
                  {selectedShelter.hazardCategoryLabel ||
                    (selectedShelter.hazardType === 'flood'
                      ? 'High-Ground Shelter'
                      : 'Open Assembly Ground')}
                </span>
                <h3 className="text-lg font-bold mt-1 text-white">{selectedShelter.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
                  <span>{selectedShelter.district || selectedShelter.address}</span>
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-slate-800">
              {/* Capacity Progress */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span>Available Safe Capacity</span>
                  <span className="text-emerald-700">
                    {Math.max(
                      0,
                      (selectedShelter.capacityTotal || 0) -
                        (selectedShelter.capacityCurrent || 0)
                    )}{' '}
                    / {selectedShelter.capacityTotal} Beds Available
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((selectedShelter.capacityCurrent || 0) /
                          (selectedShelter.capacityTotal || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Verified Facilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Verified On-Site Facilities
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(Array.isArray(selectedShelter.facilities) &&
                  selectedShelter.facilities.length > 0
                    ? selectedShelter.facilities
                    : [
                        'Clean Drinking Water',
                        'First Aid Station',
                        'Backup Generator',
                        'Sanitation Units',
                      ]
                  ).map((fac) => (
                    <div
                      key={fac}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Officer */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    {selectedShelter.coordinator?.name ||
                      selectedShelter.contactPerson ||
                      'Mr. N. Senanayake (Relief Officer)'}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {selectedShelter.coordinator?.phone ||
                      selectedShelter.phone ||
                      '+94 63 222 2341'}
                  </div>
                </div>
                <a
                  href={`tel:${(
                    selectedShelter.coordinator?.phone ||
                    selectedShelter.phone ||
                    '+94 63 222 2341'
                  ).replace(/[\s-]+/g, '')}`}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Phone size={13} />
                  <span>Call Officer</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const destination =
                      selectedShelter.coordinates?.lat &&
                      selectedShelter.coordinates?.lng
                        ? `${selectedShelter.coordinates.lat},${selectedShelter.coordinates.lng}`
                        : `${selectedShelter.name}, ${
                            selectedShelter.district || ''
                          }, Sri Lanka`;
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        destination
                      )}`,
                      '_blank'
                    );
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation size={14} />
                  <span>Get Driving Directions</span>
                </button>
                <Link
                  to="/shelters"
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Directory</span>
                  <ExternalLink size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedShelter(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[11px] font-black text-white px-2.5 py-0.5 rounded uppercase tracking-wider ${getSeverityBadgeColor(
                  selectedAlert.severity
                )}`}
              >
                {selectedAlert.severity} SEVERITY
              </span>
              <span className="text-xs text-slate-400">
                {formatTimeAgo(selectedAlert.publishedAt || selectedAlert.timestamp)}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">{selectedAlert.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Source: {selectedAlert.sourceName || selectedAlert.source || 'Disaster Management Centre (DMC)'}
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">Official Advisory Bulletin:</p>
              <p>{selectedAlert.message || selectedAlert.advisory || selectedAlert.description}</p>
            </div>

            {Array.isArray(selectedAlert.affectedDistricts) &&
              selectedAlert.affectedDistricts.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Districts:
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlert.affectedDistricts.map((d) => (
                      <span
                        key={d}
                        className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 text-xs font-medium rounded-lg"
                      >
                        📍 {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-6 flex gap-2">
              <Link
                to="/sos"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <AlertTriangle size={15} />
                <span>Need Assistance in this Zone? Report SOS</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support with Donations Modal */}
      {donationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={() => setDonationModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <PackageCheck className="text-emerald-600 stroke-[2.5]" size={22} />
              <h3 className="text-xl font-bold text-slate-900">Support Disaster Relief Supplies</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time urgent supplies requested by verified regional relief centers across Sri Lanka.
            </p>

            <div className="space-y-2.5 mb-5 max-h-60 overflow-y-auto pr-1">
              {neededSupplies.length > 0 ? (
                neededSupplies.map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => {
                      setDonationModalOpen(false);
                      navigate(`/supplies?search=${encodeURIComponent(item.itemName)}`);
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                        {item.itemName}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Needed: {item.remainingQuantity ?? item.targetQuantity} {item.unit} &bull; {item.shelterLocation}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 font-bold rounded text-[10px] shrink-0 ${
                        item.urgency === 'Immediate'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Loading active supply requests...
                </div>
              )}
            </div>

            <Link
              to="/supplies"
              onClick={() => setDonationModalOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <HeartHandshake size={16} />
              <span>Go to Supply Board & Make a Pledge</span>
            </Link>
          </div>
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {volunteerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={() => setVolunteerModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Users className="text-amber-500 stroke-[2.5]" size={22} />
              <h3 className="text-xl font-bold text-slate-900">Join ResQ-Lanka Volunteers</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Explore live community response tasks requiring volunteers on the ground.
            </p>

            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
              {openTasks.length > 0 ? (
                openTasks.map((task) => (
                  <div
                    key={task._id || task.id}
                    onClick={() => {
                      setVolunteerModalOpen(false);
                      navigate(`/tasks/${task._id || task.id}`);
                    }}
                    className="p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-amber-700">
                        {task.title}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        📍 {task.district} &bull; {task.location}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px] shrink-0">
                      {Math.max(
                        0,
                        (task.requiredVolunteers || 0) -
                          (task.assignedVolunteersCount || 0)
                      )}{' '}
                      Slots
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Loading active volunteer opportunities...
                </div>
              )}
            </div>

            <Link
              to="/tasks"
              onClick={() => setVolunteerModalOpen(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Users size={16} />
              <span>Browse All Volunteer Tasks & Apply</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
