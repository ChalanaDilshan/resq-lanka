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
  Clock,
  Radio,
  Waves,
  Sparkles,
  Layers,
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
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-amber-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-red-500 text-white';
  }
};

// Helper to parse shelter facilities safely
const getShelterFacilityList = (shelter) => {
  if (Array.isArray(shelter?.facilities)) return shelter.facilities;
  if (typeof shelter?.facilities === 'string') {
    if (shelter.facilities.includes(',')) {
      return shelter.facilities.split(',').map((f) => f.trim()).filter(Boolean);
    }
    const common = [
      'Clean Drinking Water',
      'First Aid Station',
      'Backup Generator',
      'Sanitation Units',
      'Infirmary',
      'Community Kitchen',
      'Mobile Water Tankers',
      'Field Hospital Post',
    ];
    const found = common.filter((c) =>
      shelter.facilities.toLowerCase().includes(c.toLowerCase())
    );
    if (found.length > 0) return found;
    return ['Clean Drinking Water', 'First Aid Station', 'Sanitation Units'];
  }
  return ['Clean Drinking Water', 'First Aid Station'];
};

export default function HomePage() {
  const navigate = useNavigate();

  // Dynamic filter state for Shelters and Alerts
  const [shelterFilter, setShelterFilter] = useState('All');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState('All');
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

  // Filter real alerts according to severity or hazard category
  const filteredNotices = notices.filter((n) => {
    if (alertSeverityFilter === 'All') return true;
    if (alertSeverityFilter === 'Critical & High') {
      const s = (n.severity || '').toLowerCase();
      return s === 'critical' || s === 'high';
    }
    if (alertSeverityFilter === 'Weather & Flood') {
      const h = (n.hazardType || '').toLowerCase();
      return h.includes('flood') || h.includes('rain') || h.includes('weather');
    }
    return true;
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
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-[#ef4444] hover:bg-red-600 active:scale-95 text-white font-bold rounded-2xl shadow-xl shadow-red-600/35 flex items-center justify-center gap-2.5 transition-all duration-300 group animate-float-soft hover:shadow-2xl hover:shadow-red-500/50 cursor-pointer"
            >
              <AlertTriangle size={18} className="stroke-[2.6] group-hover:rotate-12 transition-transform duration-300" />
              <span>Report an Emergency</span>
              <ArrowRight size={18} className="stroke-[2.5] transition-transform group-hover:translate-x-1.5 duration-300" />
            </Link>

            {/* Secondary Button: Find Safe Shelters */}
            <a
              href="#shelters"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('shelters')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 active:scale-95 text-[#1d4ed8] font-bold rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center gap-2.5 transition-all duration-300 group hover:shadow-2xl cursor-pointer"
            >
              <MapPin size={18} className="stroke-[2.6] text-[#1d4ed8] group-hover:scale-110 transition-transform duration-300" />
              <span>Find Safe Shelters</span>
              <ArrowRight size={18} className="stroke-[2.5] transition-transform group-hover:translate-x-1.5 duration-300" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR QUICK ACTION CARDS
          Dynamic hover lift, shadow glow, and staggered entry
         ========================================================================= */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Card 1: Report Emergency */}
          <Link
            to="/sos"
            className="animate-fade-in-up delay-1 bg-white rounded-2xl p-5 shadow-sm hover:shadow-2xl border border-slate-100 hover:border-red-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ef4444] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
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
            className="animate-fade-in-up delay-2 bg-white rounded-2xl p-5 shadow-sm hover:shadow-2xl border border-slate-100 hover:border-blue-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
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
            className="animate-fade-in-up delay-3 bg-white rounded-2xl p-5 shadow-sm hover:shadow-2xl border border-slate-100 hover:border-emerald-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
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
            className="animate-fade-in-up delay-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-2xl border border-slate-100 hover:border-amber-200 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
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
          DYNAMIC LIVE EMERGENCY BROADCAST WIRE (TICKER)
          Continuous marquee animation with real DMC alerts & helplines
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-2.5 px-4 shadow-lg shadow-red-500/15 flex items-center gap-3 overflow-hidden border border-red-400/30">
          <div className="flex items-center gap-2 flex-shrink-0 bg-black/30 px-3 py-1 rounded-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">
              Live DMC Wire
            </span>
          </div>

          {/* Scrolling Marquee Ribbon */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-ticker-marquee flex items-center gap-8 text-xs font-semibold">
              {notices.map((n, idx) => (
                <span
                  key={n._id || idx}
                  onClick={() => setSelectedAlert(n)}
                  className="inline-flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <span className="px-1.5 py-0.5 text-[9.5px] font-black uppercase rounded bg-white/20 text-white">
                    {n.severity || 'ALERT'}
                  </span>
                  <span>{n.title}</span>
                  <span className="text-white/40">&bull;</span>
                </span>
              ))}
              {/* Emergency Numbers Loop */}
              <span className="inline-flex items-center gap-2 text-amber-200 font-bold">
                <span>Sri Lanka Toll-Free Helplines:</span>
                <span className="underline">DMC: 117</span>
                <span>&bull;</span>
                <span className="underline">Ambulance: 1990</span>
                <span>&bull;</span>
                <span className="underline">Police: 119</span>
              </span>
            </div>
          </div>

          <Link
            to="/alerts"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl transition flex-shrink-0"
          >
            <span>Noticeboard</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          1. LIVE NATIONAL TELEMETRY & CRISIS COMMAND BAR
          Instant high-level situational awareness across Sri Lanka
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 w-full animate-fade-in-up">
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
          {/* Header Row: Live Network Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                National Crisis Response Telemetry
              </span>
              <span className="hidden md:inline-block text-[11.5px] font-medium text-slate-400">
                &bull; Live synchronized data feed across Sri Lanka's 25 administrative districts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                <ShieldCheck size={13} className="text-blue-600 stroke-[2.5]" />
                <span>DMC Verified Command Feeds</span>
              </span>
            </div>
          </div>

          {/* 4 Telemetry Metrics Grid with Dynamic Pulse & Hover Effects */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Emergency SOS Signals */}
            <Link
              to="/sos-dashboard"
              className="group p-4 bg-gradient-to-br from-red-50/70 to-white hover:to-red-50/95 rounded-2xl border border-red-100 hover:border-red-300 transition-all duration-300 flex items-center gap-3.5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer animate-pulse-glow-red"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <AlertTriangle size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none group-hover:scale-105 transition-transform duration-300 inline-block">
                    {liveSosCount}
                  </span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-wider bg-red-100 px-1.5 py-0.5 rounded animate-pulse">
                    Active
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                  Emergency SOS Calls
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  View Incident Grid &rarr;
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </Link>

            {/* Metric 2: Safe Havens Operating */}
            <Link
              to="/shelters"
              className="group p-4 bg-gradient-to-br from-blue-50/70 to-white hover:to-blue-50/95 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 flex items-center gap-3.5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <MapPin size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none group-hover:scale-105 transition-transform duration-300 inline-block">
                    {shelterStats?.totalShelters ?? (shelters.length || 10)}
                  </span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-100 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                  Safe Shelters Active
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {shelterStats?.totalAvailableCapacity ?? '1,200+'} beds available
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </Link>

            {/* Metric 3: Urgent Supply Demands */}
            <div
              onClick={() => setDonationModalOpen(true)}
              className="group p-4 bg-gradient-to-br from-emerald-50/70 to-white hover:to-emerald-50/95 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all duration-300 flex items-center gap-3.5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <PackageCheck size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none group-hover:scale-105 transition-transform duration-300 inline-block">
                    {supplyStats?.totalRequests ?? (neededSupplies.length || 12)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">
                    Open
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                  Relief Supply Demands
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Make a Supply Pledge &rarr;
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </div>

            {/* Metric 4: Disaster Volunteers */}
            <div
              onClick={() => setVolunteerModalOpen(true)}
              className="group p-4 bg-gradient-to-br from-amber-50/70 to-white hover:to-amber-50/95 rounded-2xl border border-amber-100 hover:border-amber-300 transition-all duration-300 flex items-center gap-3.5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Users size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none group-hover:scale-105 transition-transform duration-300 inline-block">
                    {taskStats?.totalVolunteersAssigned ?? (taskStats?.totalTasks ?? openTasks.length)}
                  </span>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider bg-amber-100 px-1.5 py-0.5 rounded">
                    On-Duty
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                  Volunteers Mobilized
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Claim Support Task &rarr;
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CORE DISASTER RESPONSE COMMAND CENTER (2 BALANCED COLUMNS)
          Col 1 (5 cols): Official Emergency Bulletins & DMC Early Warnings
          Col 2 (7 cols): Find Verified Safe Shelters (Flood High-Ground & Earthquake)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* -------------------------------------------------------------------
              COLUMN 1: OFFICIAL EMERGENCY BULLETINS (lg:col-span-5)
             ------------------------------------------------------------------- */}
          <div
            id="alerts"
            className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={18} className="stroke-[2.6]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      Official Emergency Bulletins
                    </h2>
                    <p className="text-[11.5px] text-slate-500">
                      Directives from DMC &amp; Department of Meteorology
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0 pt-1"
              >
                <span>Full Noticeboard</span>
                <ArrowRight size={14} className="stroke-[2.2]" />
              </Link>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'All', label: 'All Alerts' },
                { id: 'Critical & High', label: 'Critical & High' },
                { id: 'Weather & Flood', label: 'Flood & Rain' },
              ].map((tab) => {
                const isActive = alertSeverityFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAlertSeverityFilter(tab.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredNotices.length > 0 ? (
                filteredNotices.slice(0, 4).map((alert) => (
                  <div
                    key={alert._id || alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all duration-200 cursor-pointer relative shadow-2xs hover:shadow-xs"
                  >
                    {/* Top Row: Severity Badge, Hazard Pill, Time */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getSeverityBadgeColor(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                        {alert.hazardType && (
                          <span className="text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {alert.hazardType}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {formatTimeAgo(alert.publishedAt)}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {alert.title}
                    </h4>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5 line-clamp-2">
                      {alert.message || alert.description}
                    </p>

                    {/* Bottom Metadata: Affected Districts & Verified Tag */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          {Array.isArray(alert.affectedDistricts)
                            ? alert.affectedDistricts.join(', ')
                            : alert.affectedDistricts || 'Islandwide'}
                        </span>
                      </div>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                  {isLoading
                    ? 'Loading verified emergency bulletins...'
                    : 'No emergency alerts match the selected criteria.'}
                </div>
              )}
            </div>

            {/* Official Partnership Card */}
            <div className="mt-1 p-3.5 bg-red-50/80 border border-red-100 rounded-2xl flex items-center gap-3 text-xs text-red-800">
              <ShieldCheck size={20} className="stroke-[2.4] flex-shrink-0 text-red-600" />
              <div className="leading-snug">
                <span className="font-bold">Official Disaster Management Feeds:</span> Verified by DMC National Emergency Command. In urgent peril, dial hotline <span className="font-black underline">117</span>.
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              COLUMN 2: FIND VERIFIED SAFE SHELTERS (lg:col-span-7)
             ------------------------------------------------------------------- */}
          <div
            id="shelters"
            className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MapPin size={18} className="stroke-[2.6]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      Verified Safe Shelters &amp; Evacuation Havens
                    </h2>
                    <p className="text-[11.5px] text-slate-500">
                      High-ground flood refuges &amp; earthquake open grounds with live capacity
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/shelters"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0 pt-1"
              >
                <span>Full Directory</span>
                <ArrowRight size={14} className="stroke-[2.2]" />
              </Link>
            </div>

            {/* Search Input & Category Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search Field */}
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="shelter-search-input"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter district or town (e.g. Ampara, Batticaloa...)"
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                {searchLocation && (
                  <button
                    type="button"
                    onClick={() => setSearchLocation('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Flood (High-Ground)', 'Earthquake (Open Ground)'].map((cat) => {
                  const isActive = shelterFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setShelterFilter(cat)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
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
            </div>

            {/* Shelters Cards Grid (2-Column Spacious Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredShelters.length > 0 ? (
                filteredShelters.slice(0, 4).map((shelter) => {
                  const total = shelter.capacityTotal || 1;
                  const current = shelter.capacityCurrent || 0;
                  const pct = Math.min(100, Math.round((current / total) * 100));
                  const availableBeds = Math.max(0, total - current);
                  const isFlood = shelter.hazardType === 'flood';
                  const facilities = getShelterFacilityList(shelter);

                  return (
                    <div
                      key={shelter._id || shelter.id}
                      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Photo Header with Floating Badges */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                        <img
                          src={getShelterImage(shelter)}
                          alt={shelter.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                        {/* Top Left: Hazard Category Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10.5px] font-black px-2.5 py-1 rounded-lg text-white shadow-sm backdrop-blur-xs ${
                              isFlood ? 'bg-blue-600/90' : 'bg-emerald-600/90'
                            }`}
                          >
                            {isFlood ? '🌊 High-Ground Refuge' : '⛰️ Open Assembly Ground'}
                          </span>
                        </div>

                        {/* Top Right: Elevation or Clearance Metric */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                            {shelter.elevationMeters
                              ? `Elev: +${shelter.elevationMeters}m`
                              : shelter.clearanceRadiusMeters
                              ? `Radius: ${shelter.clearanceRadiusMeters}m`
                              : 'Verified Safe Zone'}
                          </span>
                        </div>

                        {/* Bottom Bar on Photo: District & Status */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-200 truncate">
                            <MapPin size={13} className="text-red-400 shrink-0" />
                            <span className="truncate">{shelter.district || 'Ampara'}, Sri Lanka</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              pct >= 90
                                ? 'bg-red-500 text-white'
                                : pct >= 70
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-500 text-white'
                            }`}
                          >
                            {shelter.status || (pct >= 90 ? 'Nearly Full' : 'Available')}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                        <div>
                          {/* Title */}
                          <h4
                            onClick={() => setSelectedShelter(shelter)}
                            className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1 cursor-pointer"
                          >
                            {shelter.name}
                          </h4>
                          <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-1">
                            {shelter.address}
                          </p>

                          {/* Real Occupancy Progress Bar */}
                          <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                              <span className="flex items-center gap-1">
                                <Users size={12} className="text-slate-500" />
                                <span>{current} / {total} Occupied</span>
                              </span>
                              <span
                                className={
                                  pct >= 90
                                    ? 'text-red-600'
                                    : pct >= 70
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }
                              >
                                {availableBeds} beds available
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  pct >= 90
                                    ? 'bg-red-500'
                                    : pct >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Facilities Chips */}
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {facilities.slice(0, 3).map((f) => (
                              <span
                                key={f}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                              >
                                <CheckCircle2 size={10} className="text-emerald-600" />
                                <span>{f}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const dest =
                                shelter.coordinates?.lat && shelter.coordinates?.lng
                                  ? `${shelter.coordinates.lat},${shelter.coordinates.lng}`
                                  : `${shelter.name}, ${shelter.district || ''}, Sri Lanka`;
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                  dest
                                )}`,
                                '_blank'
                              );
                            }}
                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11.5px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Navigation size={13} />
                            <span>Directions</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedShelter(shelter)}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11.5px] font-bold transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 sm:col-span-2 py-12 text-center text-slate-400 text-xs">
                  {isLoading
                    ? 'Loading verified shelters...'
                    : `No shelters found matching "${searchLocation}". Try searching by another district or town.`}
                </div>
              )}
            </div>

            {/* Bottom Link to Full Shelters Directory */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>All 10+ shelters verified by Disaster Management Centre Sri Lanka</span>
              <Link
                to="/shelters"
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>View Full Interactive Directory</span>
                <ArrowRight size={14} className="stroke-[2.2]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. RELIEF SUPPLIES & VOLUNTEER TASK BRIGADE SHOWCASE
          Bringing the other 2 pillars of ResQ-Lanka directly into the home view
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Urgent Relief Supplies Needed */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <PackageCheck size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      Urgent Relief Supplies Demands
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live requested items from regional disaster distribution bays
                    </p>
                  </div>
                </div>
                <Link
                  to="/supplies"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                >
                  <span>Supply Board</span>
                  <ArrowRight size={14} className="stroke-[2.2]" />
                </Link>
              </div>

              {/* Supplies List */}
              <div className="space-y-3">
                {neededSupplies.slice(0, 3).map((item) => {
                  const target = item.targetQuantity || 1;
                  const pledged = item.pledgedQuantity || 0;
                  const pledgedPct = Math.min(100, Math.round((pledged / target) * 100));

                  return (
                    <div
                      key={item._id || item.id}
                      onClick={() => {
                        navigate(`/supplies?search=${encodeURIComponent(item.itemName)}`);
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.urgency === 'Immediate'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.urgency}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                              {item.itemName}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            📍 {item.shelterLocation} ({item.district || 'Ampara'})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-800">
                            {item.remainingQuantity ?? item.targetQuantity} {item.unit}
                          </span>
                          <span className="block text-[10px] text-slate-400">needed</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                          <span>Pledged: {pledged} / {target} {item.unit}</span>
                          <span>{pledgedPct}% pledged</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${pledgedPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Every donation directly sustains displaced families.</span>
              <button
                type="button"
                onClick={() => setDonationModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <HeartHandshake size={15} />
                <span>Make a Supply Pledge</span>
              </button>
            </div>
          </div>

          {/* Card B: Community Volunteer Task Brigade */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Users size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      Community Volunteer Task Brigade
                    </h3>
                    <p className="text-xs text-slate-500">
                      On-ground crisis missions requiring immediate citizen volunteers
                    </p>
                  </div>
                </div>
                <Link
                  to="/tasks"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
                >
                  <span>All Tasks</span>
                  <ArrowRight size={14} className="stroke-[2.2]" />
                </Link>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {openTasks.slice(0, 3).map((task) => {
                  const openSlots = Math.max(
                    0,
                    (task.requiredVolunteers || 0) - (task.assignedVolunteersCount || 0)
                  );

                  return (
                    <div
                      key={task._id || task.id}
                      onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                      className="p-3.5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-300 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                task.priority === 'Urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {task.priority || 'Normal'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-700 transition truncate">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            📍 {task.district} &bull; {task.location}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg shrink-0">
                          {openSlots} Slots Open
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-2">
                        {task.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Provide direct relief on the ground in affected zones.</span>
              <button
                type="button"
                onClick={() => setVolunteerModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Users size={15} />
                <span>Claim Volunteer Task</span>
              </button>
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

          <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>© 2026 ResQ-Lanka. Together for a Safer Sri Lanka. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS & INTERACTIVE POPUPS (WITH DYNAMIC ENTRANCE ANIMATIONS)
         ========================================================================= */}

      {/* Shelter Detail Modal */}
      {selectedShelter && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-ios-fade">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-lg overflow-hidden relative max-h-[90vh] overflow-y-auto animate-ios-sheet sm:animate-modal-pop">
            <div className="w-10 h-1 bg-white/60 rounded-full mx-auto my-2.5 sm:hidden absolute top-0 left-0 right-0 z-20 pointer-events-none" />
            <button
              type="button"
              onClick={() => setSelectedShelter(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition cursor-pointer"
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
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
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
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95"
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
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Get Driving Directions</span>
                </button>
                <Link
                  to="/shelters"
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95"
                >
                  <span>Directory</span>
                  <ExternalLink size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedShelter(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-ios-fade">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-lg p-5 sm:p-6 relative max-h-[88vh] overflow-y-auto animate-ios-sheet sm:animate-modal-pop">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-red-600/30"
              >
                <AlertTriangle size={15} />
                <span>Need Assistance in this Zone? Report SOS</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support with Donations Modal */}
      {donationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-ios-fade">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-lg p-5 sm:p-6 relative max-h-[88vh] overflow-y-auto animate-ios-sheet sm:animate-modal-pop">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />
            <button
              type="button"
              onClick={() => setDonationModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <HeartHandshake size={16} />
              <span>Go to Supply Board & Make a Pledge</span>
            </Link>
          </div>
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {volunteerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-ios-fade">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 w-full max-w-lg p-5 sm:p-6 relative max-h-[88vh] overflow-y-auto animate-ios-sheet sm:animate-modal-pop">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />
            <button
              type="button"
              onClick={() => setVolunteerModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                    className="p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
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
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 active:scale-95"
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
