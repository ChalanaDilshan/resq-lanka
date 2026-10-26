import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  PackageCheck,
  Users,
  Bell,
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Lock,
  PhoneCall,
  Sparkles,
  Truck,
  ClipboardList,
  Compass,
  UserCheck,
} from 'lucide-react';

import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('citizen');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // What is available on the platform
  const availableServices = [
    {
      title: 'Emergency SOS & Rescue Reporting',
      badge: 'Immediate Help',
      icon: ShieldAlert,
      iconBg: 'bg-red-600',
      description:
        'If you or your family are trapped by floodwaters, landslides, or severe weather, report an emergency SOS instantly. Enter your location landmark or tap your exact spot on the interactive map so authorized rescue teams can locate you rapidly.',
      features: [
        'Instant GPS pin or address description',
        'Automatic privacy protection on your contact phone',
        'Live timeline updates as responders are dispatched',
      ],
      link: '/sos',
      linkText: 'Report an Emergency SOS',
    },
    {
      title: 'Verified Safe Shelter Directory',
      badge: 'Safe Evacuation',
      icon: Building2,
      iconBg: 'bg-blue-600',
      description:
        'Search verified government schools, temples, and community centers operating as safe disaster shelters. Check live remaining bed capacity, coordinator contact details, and flood elevation safety before you leave your home.',
      features: [
        'Real-time capacity and occupancy tracking',
        'High-ground elevation ratings for flood safety',
        'Direct phone contacts for shelter camp managers',
      ],
      link: '/shelters',
      linkText: 'Find Safe Shelters Nearby',
    },
    {
      title: 'Relief Supply & Donation Board',
      badge: 'Direct Humanitarian Aid',
      icon: PackageCheck,
      iconBg: 'bg-emerald-600',
      description:
        'See exact, verified shortages requested by camp coordinators—such as clean drinking water, dry food rations, infant formula, or bedding. Pledge supplies directly and ensure your aid reaches real displaced families.',
      features: [
        'Live inventory quotas requested directly by camps',
        'Pledge items in minutes with no guesswork',
        'Physical verification when your goods arrive at the camp',
      ],
      link: '/supplies',
      linkText: 'Browse Relief Supply Board',
    },
    {
      title: 'Community Volunteer Opportunities',
      badge: 'Civic Support',
      icon: Users,
      iconBg: 'bg-purple-600',
      description:
        'Support relief operations through safe, organized volunteer tasks. Help pack dry rations, assemble first aid kits, or welcome displaced families at camp reception desks without being put in hazardous situations.',
      features: [
        '100% non-hazardous, supervised relief roles',
        'Clear shift times, locations, and safety instructions',
        'Personal volunteer dashboard to manage your assignments',
      ],
      link: '/tasks',
      linkText: 'Explore Volunteer Tasks',
    },
    {
      title: 'Official Disaster Alerts & Early Warnings',
      badge: 'Stay Informed',
      icon: Bell,
      iconBg: 'bg-amber-600',
      description:
        'Stay ahead of extreme weather with authoritative bulletins from the Disaster Management Centre (DMC) and Department of Meteorology. Check active flood alerts, spillway warnings, and road hazard notices across all 25 districts.',
      features: [
        'Color-coded severity levels (Critical, High, Medium, Low)',
        'District-specific notifications and evacuation directives',
        'Verified government announcements with emergency hotlines',
      ],
      link: '/alerts',
      linkText: 'Check Live Warning Notices',
    },
    {
      title: 'Personalized User Dashboards',
      badge: 'Your Action Center',
      icon: Compass,
      iconBg: 'bg-indigo-600',
      description:
        'Every registered user has an organized dashboard. Check the status of your emergency SOS request, keep track of all your relief supply pledges, or view your upcoming volunteer shifts in one unified view.',
      features: [
        'Tailored views for Citizens, Volunteers, and Coordinators',
        'One-click role switching to explore different ways to help',
        'Direct shortcuts to common emergency tools',
      ],
      link: '/dashboard',
      linkText: 'Go to My Dashboard',
    },
  ];

  // How user can work - interactive workflows
  const workflows = {
    citizen: {
      role: 'Citizens in Affected Areas',
      tagline: 'Need safe shelter, food, or emergency rescue?',
      steps: [
        {
          num: '01',
          title: 'Request Help or Find a Shelter',
          desc: 'If you are in danger, tap "Emergency SOS" to send your location. If you need safe refuge, browse the "Shelters" directory to find an open camp near you with available space.',
        },
        {
          num: '02',
          title: 'Provide Simple Location Details',
          desc: 'Type your address, nearby landmarks (e.g. Near clock tower, Hospital road), or tap your location on the map. Your telephone number is kept private and only seen by rescue responders.',
        },
        {
          num: '03',
          title: 'Track Live Assistance',
          desc: 'Check the incident feed or your Citizen Dashboard. You will see when rescue teams or coordinators pick up your report and update its status from "Pending" to "In Progress".',
        },
      ],
    },
    donor: {
      role: 'Donors & Aid Organizations',
      tagline: 'Want to donate food, water, or medical supplies?',
      steps: [
        {
          num: '01',
          title: 'See Real-Time Camp Needs',
          desc: 'Open the "Donate" board to see current supply requests published directly by shelter coordinators. Items show exactly how many units are still needed.',
        },
        {
          num: '02',
          title: 'Pledge Your Contribution',
          desc: 'Click "Pledge Support" on any item. Select how many bottles of water, food packs, or medicine kits you can provide and choose your drop-off or dispatch method.',
        },
        {
          num: '03',
          title: 'Track Delivery Verification',
          desc: 'Once your goods arrive at the shelter, coordinators inspect and physically verify the stock on ResQ-Lanka. You can see your donation marked as verified in the public ledger.',
        },
      ],
    },
    volunteer: {
      role: 'Community Volunteers',
      tagline: 'Want to help displaced families on the ground?',
      steps: [
        {
          num: '01',
          title: 'Browse Available Tasks',
          desc: 'Visit the "Volunteer" board to see organized relief assignments like packing food parcels, sorting first aid kits, or registering displaced families.',
        },
        {
          num: '02',
          title: 'Sign Up for a Shift',
          desc: 'Select a task that matches your location and availability. Submit a quick application with your contact details and any relevant skills.',
        },
        {
          num: '03',
          title: 'Report to the Staging Center',
          desc: 'Once accepted, arrive at the relief center at the scheduled time. Safety guidelines, gloves, masks, and on-site briefing are provided by the coordinator.',
        },
      ],
    },
    coordinator: {
      role: 'Camp Coordinators & Authorities',
      tagline: 'Managing an evacuation center or official response?',
      steps: [
        {
          num: '01',
          title: 'Keep Shelter Capacities Updated',
          desc: 'Log in with coordinator credentials to update your shelter headcount in real time so families don’t arrive at an overcrowded facility.',
        },
        {
          num: '02',
          title: 'Request Needed Supplies',
          desc: 'Publish exact inventory shortages to the community board so generous donors know precisely what your shelter is running low on.',
        },
        {
          num: '03',
          title: 'Broadcast Warnings & Verify Aid',
          desc: 'Publish official warning advisories, approve incoming volunteer rosters, and verify physically delivered donations upon arrival.',
        },
      ],
    },
  };

  const faqs = [
    {
      q: 'Do I have to create an account to request emergency rescue or find shelter?',
      a: 'No. You can submit an emergency SOS request or search for safe evacuation shelters completely free and without registering. Creating an account simply allows you to track all your reports, donations, or volunteer applications in a personal dashboard.',
    },
    {
      q: 'How do I know if an evacuation shelter actually has room for my family?',
      a: 'Every shelter in our directory shows a live capacity meter (e.g. 120 / 250 occupants). Coordinators update these numbers as people arrive. Shelters that reach full capacity are labeled "At Capacity" or "Nearly Full", and if a facility closes, it is clearly marked so you can head to an alternate shelter.',
    },
    {
      q: 'Is my phone number visible to the general public when I ask for help?',
      a: 'No. ResQ-Lanka automatically masks your phone number on public feeds (e.g., 077 123 4567 appears as 077 **** 567) to protect your family from spam or unauthorized calls. Only authorized rescue personnel and shelter coordinators can view your full contact number.',
    },
    {
      q: 'How does ResQ-Lanka prevent fake or phantom donations?',
      a: 'When someone pledges to donate an item, the board shows it as "Pledged". However, the item is only counted as "Fulfilled" after the shelter coordinator physically receives the shipment, counts it, and marks it verified on the system.',
    },
    {
      q: 'Can volunteers participate in dangerous flood rescues?',
      a: 'No. Hazardous swift-water, boat extractions, and landslide rescues are handled exclusively by the Tri-Forces, Police, and certified Disaster Management Centre (DMC) units. ResQ-Lanka volunteers assist strictly with safe, non-hazardous support tasks like packing food hampers, sorting medical kits, and registering families.',
    },
    {
      q: 'Who should I contact immediately if lives are in immediate danger?',
      a: 'For immediate, life-threatening emergencies, always dial the National Disaster Management Hotline at 117, Suwa Seriya Ambulance at 1990, or Emergency Police at 119. ResQ-Lanka works alongside these national hotlines to coordinate ground assistance.',
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
            alt="Disaster Response"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/95 to-slate-900" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 mb-5">
            <Sparkles size={14} />
            <span>Community Disaster Relief & Coordination Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
            Connecting Communities, Safe Shelters & Relief Aid Across Sri Lanka
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            ResQ-Lanka is an open, community-first platform built to help citizens, donors, volunteers, and camp coordinators
            stay connected during monsoonal floods, landslides, and emergencies. Here is everything you can do on the platform.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <Link
              to="/sos"
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <ShieldAlert size={18} />
              <span>Ask for Emergency Help</span>
            </Link>
            <Link
              to="/shelters"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Building2 size={18} />
              <span>Find Safe Shelters</span>
            </Link>
            <Link
              to="/supplies"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <PackageCheck size={18} />
              <span>Donate Relief Items</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK VALUE STATS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">SOS</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Direct Rescue Broadcast</div>
            <p className="text-[11px] text-slate-500">Fast reporting with map location</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">Live</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Shelter Capacity Tracking</div>
            <p className="text-[11px] text-slate-500">Know where open beds are</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">100%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Physically Verified Aid</div>
            <p className="text-[11px] text-slate-500">Direct delivery to verified camps</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight">Safe</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Volunteer Assignments</div>
            <p className="text-[11px] text-slate-500">Organized, non-hazardous community tasks</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          WHAT IS AVAILABLE ON THE PLATFORM (SERVICES & FEATURES)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 mb-3">
            <Compass size={14} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What You Can Do on ResQ-Lanka
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything you need during a disaster is organized into clear, accessible tools designed for fast action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${service.iconBg} text-white flex items-center justify-center shadow-md`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-[11.5px] text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={service.link}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                  >
                    <span>{service.linkText}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          HOW USERS CAN WORK (STEP-BY-STEP WORKFLOWS BY ROLE)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-2">
              <ClipboardList size={14} />
              <span>How It Works For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple Steps to Take Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select who you are below to see how easy it is to use ResQ-Lanka:
            </p>

            {/* Workflow Role Selector Tabs */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-xl mx-auto">
              {[
                { id: 'citizen', label: 'Affected Citizen' },
                { id: 'donor', label: 'Relief Donor' },
                { id: 'volunteer', label: 'Volunteer' },
                { id: 'coordinator', label: 'Camp Coordinator' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Steps Card */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {workflows[activeTab].role}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {workflows[activeTab].tagline}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                3-Step Guide
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workflows[activeTab].steps.map((st) => (
                <div key={st.num} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {st.num}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{st.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY SAFETY & PRIVACY PROMISES
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 mb-3">
              <UserCheck size={14} />
              <span>Our Safety Commitment</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Designed with Protection, Privacy & Ground Truth in Mind
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              During an emergency, trust and accuracy matter most. ResQ-Lanka follows strict guidelines to keep you safe:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">Your Contact Phone is Kept Private</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you post an emergency request, your contact number is masked (e.g. 077 **** 567) so only official responders can access it.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Truck size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">Verified Aid Delivery</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We never assume promised donations have arrived. Shelter coordinators must inspect and physically count stock at the camp.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <HeartHandshake size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">No Untrained Hazard Rescues</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Swift-water boat rescues are handled exclusively by authorized military & DMC teams. Community volunteers help only with safe ground tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EMERGENCY HOTLINES STRIP
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/30">
              <PhoneCall size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-950">Immediate Life-Threatening Emergency?</h3>
              <p className="text-xs sm:text-sm text-red-700 mt-0.5">
                Always contact Sri Lanka’s 24/7 national emergency hotlines for direct extraction and paramedic dispatch.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <div className="bg-white px-4 py-2 rounded-xl border border-red-200 text-center">
              <span className="text-[10px] uppercase font-bold text-red-600 block">DMC Hotline</span>
              <span className="text-lg font-black text-slate-900">117</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-red-200 text-center">
              <span className="text-[10px] uppercase font-bold text-red-600 block">Ambulance</span>
              <span className="text-lg font-black text-slate-900">1990</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-red-200 text-center">
              <span className="text-[10px] uppercase font-bold text-red-600 block">Police Emergency</span>
              <span className="text-lg font-black text-slate-900">119</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS (PRACTICAL USER FAQS)
         ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 mb-2">
            <CheckCircle2 size={14} />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find quick answers to how ResQ-Lanka helps you during a disaster:
          </p>
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
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Join the ResQ-Lanka Community Today
          </h2>
          <p className="text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Every verified shelter bed, pledged water bottle, and volunteer hour makes a tangible difference to families
            rebuilding after disaster.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-slate-900 font-bold rounded-2xl text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/shelters"
              className="px-6 py-3.5 bg-blue-900/80 hover:bg-blue-900 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition"
            >
              Browse Safe Shelters
            </Link>
            <Link
              to="/supplies"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md"
            >
              Donate Supplies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
