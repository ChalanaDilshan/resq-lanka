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
  Lock,
  PhoneCall,
  Truck,
  Compass,
  ShieldCheck,
} from 'lucide-react';

import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('citizen');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Verified capabilities on the platform
  const availableServices = [
    {
      title: 'Emergency SOS & Rescue Reporting',
      badge: 'Immediate Help',
      icon: ShieldAlert,
      description:
        'If you or your family are trapped by rising floodwaters, landslides, or severe weather, submit an emergency SOS report immediately. Enter your landmark or select your coordinates on the interactive map so authorized rescue responders can dispatch aid.',
      features: [
        'Precise GPS coordinates or landmark descriptions',
        'Automatic phone number masking to safeguard family privacy',
        'Transparent status tracking from Pending to Rescued',
      ],
      link: '/sos',
      linkText: 'Report an Emergency SOS',
    },
    {
      title: 'Verified Safe Shelter Directory',
      badge: 'Safe Evacuation',
      icon: Building2,
      description:
        'Locate verified government schools, temples, and community centers operating as temporary disaster shelters. View real-time bed capacity, site coordinator contact details, and elevation ratings before traveling.',
      features: [
        'Live bed capacity and occupancy tracking',
        'High-ground elevation assessment for flood resistance',
        'Direct phone contacts for verified camp managers',
      ],
      link: '/shelters',
      linkText: 'Find Safe Shelters Nearby',
    },
    {
      title: 'Relief Supply & Donation Board',
      badge: 'Direct Humanitarian Aid',
      icon: PackageCheck,
      description:
        'View specific, verified supply shortages requested directly by shelter coordinators—including bottled water, dry food rations, infant milk, and hygiene kits. Pledge aid directly where it is urgently required.',
      features: [
        'Shortage requests logged directly by on-site managers',
        'Pledge contributions online with delivery method tracking',
        'On-site physical inspection before inventory is marked verified',
      ],
      link: '/supplies',
      linkText: 'Browse Relief Supply Board',
    },
    {
      title: 'Civic Volunteer Coordination',
      badge: 'Community Support',
      icon: Users,
      description:
        'Support community relief operations through safe, organized volunteer assignments. Assist with packing dry rations, sorting relief materials, or greeting displaced families without exposure to hazardous field conditions.',
      features: [
        'Strictly supervised non-hazardous community relief roles',
        'Clear shift schedules, locations, and safety briefings',
        'Personal volunteer console to manage active assignments',
      ],
      link: '/tasks',
      linkText: 'Explore Volunteer Tasks',
    },
    {
      title: 'Official Disaster Alerts & Bulletins',
      badge: 'Early Warnings',
      icon: Bell,
      description:
        'Stay informed with verified alerts from the Disaster Management Centre (DMC) and Department of Meteorology. Monitor river basin water levels, reservoir spillway warnings, and road closures across all 25 districts.',
      features: [
        'Standardized 4-tier alert severity scale',
        'District-level warnings and evacuation advisories',
        'Direct source verification links to official bulletins',
      ],
      link: '/alerts',
      linkText: 'View Disaster Advisories',
    },
    {
      title: 'Role-Aware Action Consoles',
      badge: 'Operational Tools',
      icon: Compass,
      description:
        'Registered users access an operational console tailored to their role. Monitor the status of your emergency SOS request, keep track of all relief pledges, or view assigned volunteer shifts in one organized interface.',
      features: [
        'Tailored views for Citizens, Volunteers, and Coordinators',
        'Unified record of emergency submissions and pledges',
        'Direct access to official communication hotlines',
      ],
      link: '/dashboard',
      linkText: 'Access Your Dashboard',
    },
  ];

  // Workflows by role
  const workflows = {
    citizen: {
      role: 'Citizens in Affected Areas',
      tagline: 'Need safe refuge, food supplies, or emergency extraction?',
      steps: [
        {
          num: '1',
          title: 'Request Rescue or Find Shelter',
          desc: 'If trapped or in direct danger, submit an Emergency SOS with your location. If you need safe evacuation lodging, browse the Shelters directory to find an open facility with confirmed capacity.',
        },
        {
          num: '2',
          title: 'Provide Clear Landmarks',
          desc: 'State your address, village, or nearby recognizable landmarks. Your telephone number is automatically masked from public feeds to prevent unsolicited calls.',
        },
        {
          num: '3',
          title: 'Track Response Progress',
          desc: 'Monitor your request status in real time. Coordinators and authorized rescue personnel update the incident timeline when dispatched to your location.',
        },
      ],
    },
    donor: {
      role: 'Relief Donors & Aid Organizations',
      tagline: 'Want to donate clean water, food rations, or essential supplies?',
      steps: [
        {
          num: '1',
          title: 'Inspect Live Camp Requirements',
          desc: 'Review the Relief Supply Board to view active inventory shortages published directly by verified shelter camp coordinators across Sri Lanka.',
        },
        {
          num: '2',
          title: 'Pledge Specific Quantities',
          desc: 'Choose an item and specify the exact quantity of rations, water cartons, or medical supplies you will deliver, alongside your scheduled dispatch timeline.',
        },
        {
          num: '3',
          title: 'Physical Receipt & Verification',
          desc: 'When your goods reach the shelter, camp staff inspect and count the stock, updating the public ledger to "Fulfilled" so donors have complete transparency.',
        },
      ],
    },
    volunteer: {
      role: 'Civic Volunteers',
      tagline: 'Ready to assist displaced families with ground relief logistics?',
      steps: [
        {
          num: '1',
          title: 'Browse Authorized Tasks',
          desc: 'Explore available relief opportunities such as dry rations packaging, logistics registration, and care support in your home district.',
        },
        {
          num: '2',
          title: 'Submit Application & Availability',
          desc: 'Select a task matching your schedule and skills. Acknowledge the civilian non-hazardous safety directive before submitting.',
        },
        {
          num: '3',
          title: 'Report to Staging Point',
          desc: 'Upon approval by a relief coordinator, report to the designated staging center on time with appropriate safety footwear and visibility gear.',
        },
      ],
    },
    coordinator: {
      role: 'Camp Coordinators & Officials',
      tagline: 'Managing an evacuation shelter or district relief staging post?',
      steps: [
        {
          num: '1',
          title: 'Update Headcount & Bed Availability',
          desc: 'Log in with coordinator credentials to maintain real-time shelter capacity so evacuees are not directed to overcrowded facilities.',
        },
        {
          num: '2',
          title: 'Publish Verified Supply Shortages',
          desc: 'Log exact shortages of drinking water, medicines, and dry foods to the public relief board so donors can supply what is urgently needed.',
        },
        {
          num: '3',
          title: 'Verify Aid & Manage Responders',
          desc: 'Approve volunteer applications, supervise non-hazardous operations, and physically verify incoming donations upon arrival.',
        },
      ],
    },
  };

  const faqs = [
    {
      q: 'Do I have to register an account to report an emergency or locate safe shelters?',
      a: 'No. You can submit an emergency SOS request and search the entire safe shelter directory completely free and without an account. Registering simply allows you to track multiple requests, manage volunteer rosters, or monitor donation pledges over time.',
    },
    {
      q: 'How is shelter capacity kept accurate during rapidly evolving disasters?',
      a: 'Shelter managers and ground coordinators update occupancy numbers directly through their operational console. Facilities that reach their maximum limits are automatically flagged as "At Capacity" to redirect families toward alternate high-ground shelters.',
    },
    {
      q: 'Is my phone number visible to the public when I report an SOS?',
      a: 'No. ResQ-Lanka enforces privacy-first data masking on all public incident feeds (e.g., 077 123 4567 is displayed as 077 **** 567). Only authenticated rescue coordinators and emergency personnel have access to full contact numbers.',
    },
    {
      q: 'How does the platform prevent phantom or unverified donation pledges?',
      a: 'A pledged contribution remains in "Pledged" status until the physical shipment reaches the evacuation center. The camp manager inspects the items and records physical verification before it counts toward the fulfilled quota.',
    },
    {
      q: 'Are civilian volunteers deployed for hazardous flood rescues?',
      a: 'No. Deep-water rescues, boat extractions, and unstable structural operations are strictly conducted by the Sri Lanka Navy, Army, Police Special Task Force, and certified Disaster Management Centre rescue teams. Volunteers participate solely in supervised, non-hazardous support roles.',
    },
    {
      q: 'Which official hotlines should I call if immediate life safety is at risk?',
      a: 'For life-threatening emergencies requiring direct rescue or medical dispatch, immediately dial the National Disaster Management Centre (117), the Suwa Seriya Ambulance Service (1990), or the Sri Lanka Police Emergency Service (119).',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* =========================================================================
          CIVIC HERO SECTION
         ========================================================================= */}
      <header className="relative bg-slate-900 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={heroDisasterBg}
            alt="Disaster Relief Operations"
            className="w-full h-full object-cover object-center grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold mb-4">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Sri Lanka Community Disaster Relief &amp; Emergency Coordination</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl leading-tight">
            Connecting Communities, Safe Shelters &amp; Relief Operations Across Sri Lanka
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            ResQ-Lanka is an open, community-first emergency response network built to support
            displaced citizens, relief donors, civic volunteers, and shelter managers during
            monsoonal floods, landslides, and extreme weather emergencies.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/sos"
              className="px-4 py-2.5 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs"
            >
              <ShieldAlert size={16} />
              <span>Report an Emergency SOS</span>
            </Link>
            <Link
              to="/shelters"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Building2 size={16} />
              <span>Find Safe Shelters</span>
            </Link>
            <Link
              to="/supplies"
              className="px-4 py-2.5 bg-slate-100 hover:bg-white text-slate-900 font-semibold rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <PackageCheck size={16} />
              <span>Donate Relief Supplies</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          OPERATIONAL PILLARS
         ========================================================================= */}
      <section
        aria-label="Core operational pillars"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20"
      >
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1 sm:border-r border-slate-200 sm:pr-4">
            <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">
              Emergency SOS
            </div>
            <h2 className="text-sm font-bold text-slate-900">Direct Rescue Broadcast</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast reporting with GPS coordinates and automatic contact phone masking.
            </p>
          </div>

          <div className="space-y-1 sm:border-r border-slate-200 sm:pr-4">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Real-Time Tracking
            </div>
            <h2 className="text-sm font-bold text-slate-900">Verified Shelter Capacity</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live bed counts, high-ground elevation safety ratings, and camp contact details.
            </p>
          </div>

          <div className="space-y-1 sm:border-r border-slate-200 sm:pr-4">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              On-Site Audit
            </div>
            <h2 className="text-sm font-bold text-slate-900">Physically Verified Aid</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donations are confirmed only after shelter coordinators inspect physical deliveries.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Civilian Safety
            </div>
            <h2 className="text-sm font-bold text-slate-900">Structured Non-Hazard Roles</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strictly supervised packing, logistics, and registration without hazard exposure.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PLATFORM CAPABILITIES
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            What You Can Do on ResQ-Lanka
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Essential emergency relief tools organized into clear, verified civic services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableServices.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="bg-white rounded-xl p-5 border border-slate-300 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Link
                    to={service.link}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-block"
                  >
                    {service.linkText}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          HOW USERS WORK (ROLE WORKFLOWS)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-300 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Operational Workflows
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              How ResQ-Lanka Works for You
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select your role to view clear, step-by-step guidance on taking action:
            </p>

            {/* Role Selector Tabs */}
            <div className="mt-4 flex flex-wrap gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
              {[
                { id: 'citizen', label: 'Affected Citizen' },
                { id: 'donor', label: 'Relief Donor' },
                { id: 'volunteer', label: 'Civic Volunteer' },
                { id: 'coordinator', label: 'Camp Coordinator' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Steps Display */}
          <div className="bg-slate-50 rounded-lg p-5 sm:p-6 border border-slate-200 space-y-5">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {workflows[activeTab].role}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {workflows[activeTab].tagline}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workflows[activeTab].steps.map((st) => (
                <div
                  key={st.num}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="text-xs font-bold text-slate-500">
                    Step {st.num}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SAFETY, PRIVACY & VERIFICATION PROMISES
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-emerald-400">
              Institutional Commitments
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Civilian Protection, Privacy &amp; Data Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              In a national crisis, accurate information saves lives. ResQ-Lanka adheres to rigorous protocols to protect all participants:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
                <Lock size={16} className="text-blue-400" />
                <span>Contact Phone Privacy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emergency contact numbers are automatically masked on all public feeds. Full telephone numbers are accessible solely to authenticated rescue teams and verified shelter managers.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
                <Truck size={16} className="text-emerald-400" />
                <span>Physically Audited Supplies</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Donations are never recorded as fulfilled based on promises alone. Shelter coordinators inspect and physically count relief inventory upon arrival at the facility.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
                <HeartHandshake size={16} className="text-amber-400" />
                <span>Hazard-Free Civilian Roles</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Swift-water boat rescues and structural extractions are conducted strictly by Tri-Forces and certified DMC units. Volunteers participate exclusively in organized, safe logistical tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NATIONAL EMERGENCY HOTLINES STRIP
         ========================================================================= */}
      <section
        aria-label="National Emergency Hotlines"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16"
      >
        <div className="bg-red-50 border border-red-300 rounded-xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5 max-w-xl">
            <PhoneCall size={24} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-red-950">
                Immediate Life-Threatening Emergency?
              </h2>
              <p className="text-xs sm:text-sm text-red-900 mt-0.5 leading-relaxed">
                For swift-water trapped families, direct medical emergencies, or urgent evacuation, dial Sri Lanka&apos;s 24/7 national emergency response lines immediately:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <a
              href="tel:117"
              className="bg-white hover:bg-slate-50 px-4 py-2 rounded-lg border border-red-200 text-center transition-colors flex-1 sm:flex-initial"
            >
              <span className="text-[11px] font-semibold text-slate-600 block">DMC Hotline</span>
              <span className="text-lg font-bold text-red-700 tabular-nums">117</span>
            </a>
            <a
              href="tel:1990"
              className="bg-white hover:bg-slate-50 px-4 py-2 rounded-lg border border-red-200 text-center transition-colors flex-1 sm:flex-initial"
            >
              <span className="text-[11px] font-semibold text-slate-600 block">Ambulance</span>
              <span className="text-lg font-bold text-red-700 tabular-nums">1990</span>
            </a>
            <a
              href="tel:119"
              className="bg-white hover:bg-slate-50 px-4 py-2 rounded-lg border border-red-200 text-center transition-colors flex-1 sm:flex-initial"
            >
              <span className="text-[11px] font-semibold text-slate-600 block">Police Emergency</span>
              <span className="text-lg font-bold text-red-700 tabular-nums">119</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS
         ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Support &amp; Answers
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Common questions regarding ResQ-Lanka disaster coordination and operations:
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                aria-expanded={openFaq === idx}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:text-blue-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-blue-700' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CIVIC ACTION FOOTER
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-slate-900 text-white rounded-xl p-8 sm:p-10 text-center border border-slate-800 space-y-4">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white">
            Support Sri Lanka&apos;s Disaster Relief Network
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Every reported emergency pin, verified shelter occupancy update, pledged water bottle, and volunteer hour supports vulnerable families during critical hours.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2.5 bg-white text-slate-900 font-semibold rounded-lg text-xs sm:text-sm hover:bg-slate-100 transition-colors"
            >
              Register Responder Profile
            </Link>
            <Link
              to="/shelters"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              View Safe Shelters
            </Link>
            <Link
              to="/supplies"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              Donate Relief Supplies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
