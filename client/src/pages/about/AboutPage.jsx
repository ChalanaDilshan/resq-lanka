import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  PackageCheck,
  Users,
  Bell,
  HeartHandshake,
  Compass,
  Award,
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  MapPin,
  Activity,
  Layers,
  Database,
  Lock,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

import ResQLogo from '../../components/shared/ResQLogo';
import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const corePillars = [
    {
      id: 'mod1',
      title: 'Module 1: Emergency SOS Incident Triage',
      badge: 'Rapid Response',
      color: 'border-red-500/30 bg-red-50/50 text-red-700',
      icon: ShieldAlert,
      iconBg: 'bg-red-600',
      description:
        'A life-saving channel for flood-trapped citizens to broadcast emergency rescue coordinates with GPS precision. Integrates automatic contact privacy masking (077 **** 567) and status history audit logs.',
      link: '/sos',
      linkText: 'Open SOS Portal',
    },
    {
      id: 'mod2',
      title: 'Module 2: Certified Safe Shelter Directory',
      badge: 'Capacity Tracking',
      color: 'border-blue-500/30 bg-blue-50/50 text-blue-700',
      icon: Building2,
      iconBg: 'bg-blue-600',
      description:
        'Live multi-hazard directory indexing verified evacuation centers across disaster-prone districts. Features real-time occupancy decrementing, elevation ratings, and manual closure safety invariants.',
      link: '/shelters',
      linkText: 'Browse Safe Shelters',
    },
    {
      id: 'mod3',
      title: 'Module 3: Relief Supplies & Verified Pledges',
      badge: 'Inventory Integrity',
      color: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-700',
      icon: PackageCheck,
      iconBg: 'bg-emerald-600',
      description:
        'Prevents phantom aid by establishing strict distinctions between target quotas, donor pledges, and physically verified received inventory at flood staging centers.',
      link: '/supplies',
      linkText: 'View Relief Supply Board',
    },
    {
      id: 'mod4',
      title: 'Module 4: Non-Hazardous Volunteer Mobilization',
      badge: 'Civic Action',
      color: 'border-purple-500/30 bg-purple-50/50 text-purple-700',
      icon: Users,
      iconBg: 'bg-purple-600',
      description:
        'Coordinates community goodwill into structured disaster response roles like dry rations packing, first aid clinic staging, and family intake without placing untrained citizens in danger.',
      link: '/tasks',
      linkText: 'Explore Volunteer Tasks',
    },
    {
      id: 'mod5',
      title: 'Module 5: Early Warning Alerts & Noticeboard',
      badge: 'Authoritative Broadcasts',
      color: 'border-amber-500/30 bg-amber-50/50 text-amber-700',
      icon: Bell,
      iconBg: 'bg-amber-600',
      description:
        'Official 4-tier alert system (Critical, High, Medium, Low) disseminating DMC advisories and Met Department bulletins with 25-district tracking and verification lifecycles.',
      link: '/alerts',
      linkText: 'Check Live Noticeboard',
    },
    {
      id: 'mod6',
      title: 'Module 6: Role-Aware Operational Dashboards',
      badge: 'Unified Command',
      color: 'border-indigo-500/30 bg-indigo-50/50 text-indigo-700',
      icon: Compass,
      iconBg: 'bg-indigo-600',
      description:
        'Tailored telemetry dashboards for Citizens, Volunteers, and Emergency Administrators delivering real-time situation reports, rapid status toggles, and role authorization.',
      link: '/dashboard',
      linkText: 'Go to Command Center',
    },
  ];

  const institutionalPartners = [
    {
      name: 'Disaster Management Centre (DMC)',
      role: 'National Warning & Evacuation Directives',
      hotline: 'Hotline: 117',
      district: 'National / All 25 Districts',
      badge: 'Apex Authority',
    },
    {
      name: 'Department of Meteorology',
      role: 'Monsoon, Rainfall & Severe Weather Forecasts',
      hotline: 'Call: +94 11 269 4104',
      district: 'Islandwide Telemetry',
      badge: 'Weather Telemetry',
    },
    {
      name: 'Irrigation Department & DMC Basin Divisions',
      role: 'Reservoir Spillway Operations (Gal Oya, Mahaweli)',
      hotline: 'Call: +94 11 258 4984',
      district: 'Major River Basins',
      badge: 'Hydrological',
    },
    {
      name: 'National Building Research Organisation (NBRO)',
      role: 'Landslide Risk Assessments & Slope Warnings',
      hotline: 'Call: +94 11 258 8946',
      district: 'Central Highlands',
      badge: 'Geological',
    },
  ];

  const faqs = [
    {
      q: 'What is ResQ-Lanka and why was it developed?',
      a: 'ResQ-Lanka is a centralized emergency humanitarian platform developed as part of the SWT22022 Practical for Internet Application Development at the South Eastern University of Sri Lanka (SEUSL). It addresses the critical information fragmentation experienced during Sri Lankan monsoon floods and cyclones by connecting affected citizens, safe shelters, verified donors, and volunteer networks.',
    },
    {
      q: 'How does ResQ-Lanka verify that relief supplies actually arrive?',
      a: 'Unlike traditional open pledge boards that count promises as finished aid, ResQ-Lanka enforces a strict physical verification lifecycle. When a donor pledges an item, its status transitions to "Partially Pledged" or "Fully Pledged", but the item is ONLY marked "Fulfilled" once shelter coordinators physically inspect and confirm delivery at the relief staging center.',
    },
    {
      q: 'Is my personal contact information safe when submitting an emergency SOS?',
      a: 'Yes. ResQ-Lanka applies automated data sanitization and contact masking on public incident feeds (e.g. 077 123 4567 becomes 077 **** 567). Only authenticated rescue responders and disaster management coordinators can access the raw unmasked telephone number to coordinate physical rescue logistics.',
    },
    {
      q: 'Can community members register as volunteers for hazardous rescue operations?',
      a: 'No. ResQ-Lanka strictly complies with national humanitarian safety protocols. Hazardous swift-water and structural rescues are exclusively handled by specialized tri-forces and certified DMC teams. Community volunteers are mobilized strictly for certified non-hazardous tasks like dry rations packing, camp registration, and first aid sorting.',
    },
    {
      q: 'How does the role-based access control (RBAC) system function?',
      a: 'ResQ-Lanka implements three canonical roles: Citizen (public emergency submission, shelter searching, item pledging), Volunteer (task roster applications, field assistance), and Administrator/Coordinator (shelter management, official notice publishing, application approval, and quota tracking). All protected endpoints are secured via JWT authorization.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 selection:bg-red-600 selection:text-white">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={heroDisasterBg}
            alt="Disaster Response Operation"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/95 to-slate-900" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              <Sparkles size={14} />
              <span>ResQ-Lanka Humanitarian Initiative</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <GraduationCap size={14} />
              <span>SEUSL Group J — Internet Application Development</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
            Coordinating Disaster Resilience & Rapid Humanitarian Relief Across Sri Lanka
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            ResQ-Lanka unites citizens facing emergency floods and landslides with certified safe shelters,
            verified donor inventory, structured volunteer squads, and official Disaster Management Centre (DMC) directives.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <Link
              to="/sos"
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <ShieldAlert size={18} />
              <span>Emergency SOS Portal</span>
            </Link>
            <Link
              to="/shelters"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Building2 size={18} />
              <span>Safe Shelter Directory</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Compass size={18} />
              <span>Operations Command Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          IMPACT & ARCHITECTURAL METRICS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">25</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Districts Covered</div>
            <p className="text-[11px] text-slate-500">From Ampara to Colombo & Jaffna</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">117</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">DMC Hotline Integration</div>
            <p className="text-[11px] text-slate-500">Direct linkage to national emergency responders</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">100%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Physical Stock Audited</div>
            <p className="text-[11px] text-slate-500">Zero phantom donations or unaccounted quotas</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight">6</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Core Modular Pillars</div>
            <p className="text-[11px] text-slate-500">Full lifecycle disaster management</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MISSION & THE PROBLEM STATEMENT
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
              <Compass size={14} />
              <span>Our Foundational Mission</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Eliminating the Information Bottleneck in Sri Lankan Disasters
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              When monsoonal cloudbursts trigger flash flooding along the Gal Oya, Kelani, or Mahaweli basins,
              communities face severe coordination challenges. Emergency phone lines congest, relief supplies arrive at
              the wrong shelters, and rumors spread on social media without verification.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              <strong>ResQ-Lanka</strong> replaces chaotic spreadsheets and unvetted messages with an authoritative,
              real-time operational network. Every shelter capacity update, supply pledge, and volunteer dispatch is verified
              by authorized coordinators and tied to actionable records.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Zero Latency Emergency Feed</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Verified Safe Evacuation Camps</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Physical Aid Delivery Checks</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Non-Hazardous Volunteer Safety</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Our Guiding Humanitarian Principles</h3>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    1
                  </span>
                  <span>
                    <strong>Human Life Above All:</strong> Immediate rescue triage takes precedence over administrative bureaucracy.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    2
                  </span>
                  <span>
                    <strong>Radical Data Transparency:</strong> Relief quotas and shelter occupancies reflect ground truth rather than optimistic estimates.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    3
                  </span>
                  <span>
                    <strong>Volunteer Safety Integrity:</strong> Untrained community volunteers are never dispatched into hazardous swift-water rescues.
                  </span>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Disaster Management Centre Linkage</div>
                  <div className="text-[11px] text-slate-400">National Emergency Operations Hotline 117</div>
                </div>
                <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <PhoneCall size={14} />
                  <span>Call 117</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE 6 MODULAR PILLARS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-3">
            <Layers size={14} />
            <span>Architecture & Modules</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered Across 6 Specialized Operational Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Each module is built with strict invariants and role-based policies to guarantee fault-tolerant disaster relief.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corePillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${p.iconBg} text-white flex items-center justify-center shadow-md`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={p.link}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                  >
                    <span>{p.linkText}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          INSTITUTIONAL PARTNERS & DISASTER AUTHORITIES
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 mb-2">
                <Award size={14} />
                <span>Inter-Agency Collaboration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Aligning with National Disaster Management Bodies
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                ResQ-Lanka references the official protocols and contact lines of the Sri Lankan emergency services.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-slate-400 block font-medium">National Emergency Operations</span>
              <span className="text-lg font-bold text-red-400">Toll-Free 117</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {institutionalPartners.map((inst) => (
              <div
                key={inst.name}
                className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    {inst.badge}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{inst.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{inst.role}</p>
                </div>
                <div className="pt-3 border-t border-slate-700 text-xs font-bold text-emerald-400">
                  {inst.hotline}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          TECHNICAL SPECIFICATION & SECURITY
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                <Database size={14} />
                <span>Engineering & Fullstack Tech</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Built with Modern Fullstack Web Standards
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ResQ-Lanka is developed with a decoupled client-server architecture designed for high availability
                and minimal payload overhead during peak network congestion in flood events.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['React 19', 'Vite 8', 'Express 5', 'Node.js', 'MongoDB', 'Mongoose 9', 'Tailwind CSS', 'JWT Auth', 'RBAC Security'].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs border border-slate-200"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Lock size={16} className="text-blue-600" />
                  <span>Privacy Phone Masking</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Public incident feeds automatically obscure sensitive citizen contact numbers (e.g. 077 **** 567) to prevent unauthorized harassment.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Activity size={16} className="text-emerald-600" />
                  <span>116 Automated Invariant Tests</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rigorous schema test suites prevent negative occupancy, phantom supply fulfilment, and invalid disaster categories.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <MapPin size={16} className="text-red-600" />
                  <span>Real GPS Geo-Tagging</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Exact coordinates captured via browser Geolocation API or interactive map pin clicks with Sri Lankan boundary validation.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <GraduationCap size={16} className="text-purple-600" />
                  <span>Academic Engineering</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  SEUSL SWT22022 practical group project adhering to professional software engineering patterns and modular architecture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ACADEMIC PROJECT CREDITS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl text-center sm:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 border border-white/20">
              <GraduationCap size={16} />
              <span>Academic Context & University Credits</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              South Eastern University of Sri Lanka (SEUSL)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Developed for the <strong>SWT22022 Practical for Internet Application Development</strong> by{' '}
              <strong>Group J</strong>. Designed to bridge the digital gap in community disaster preparedness with special
              focus on Eastern Province river basins and seasonal coastal monsoon resilience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/login"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs sm:text-sm transition shadow-md"
            >
              Sign In to Demo
            </Link>
            <a
              href="https://github.com/ChalanaDilshan/resq-lanka"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs sm:text-sm border border-slate-700 transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION
         ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 mb-2">
            <CheckCircle2 size={14} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Common Questions About ResQ-Lanka
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mx-auto mb-2">
            <ResQLogo />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Support Disaster Relief in Sri Lanka?
          </h2>
          <p className="text-xs sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed">
            Whether you are pledging essential rations, registering as a relief volunteer, or coordinating evacuation
            shelters, your participation saves lives.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-slate-900 font-bold rounded-2xl text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg"
            >
              Create Account
            </Link>
            <Link
              to="/supplies"
              className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-900 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition"
            >
              Pledge Relief Supplies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
