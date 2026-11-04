import { ShieldAlert, HeartPulse, Radio, Phone } from 'lucide-react';

export default function NationalEmergencyBar() {
  return (
    <div className="bg-slate-950 border-b border-slate-850 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: National Response Grid Operational Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-white tracking-tight text-[11px] sm:text-xs">
            National Disaster Response Grid
          </span>
          <span className="hidden md:inline text-slate-500 text-[10.5px]">
            &bull; Live Relief &amp; Emergency Telemetry
          </span>
        </div>

        {/* Right: Direct National Emergency Helplines */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline text-slate-400 font-medium text-[10.5px]">
            Official Direct Helplines:
          </span>

          {/* 117 DMC */}
          <a
            href="tel:117"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-colors tabular-nums font-mono text-[10.5px] sm:text-xs font-bold ios-press"
            title="Disaster Management Centre Direct Emergency Helpline (117)"
          >
            <ShieldAlert size={12} className="text-rose-400 shrink-0" />
            <span>117</span>
            <span className="text-[9.5px] text-slate-400 font-sans hidden xs:inline">DMC</span>
          </a>

          {/* 1990 Suwaseriya Free Ambulance */}
          <a
            href="tel:1990"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-colors tabular-nums font-mono text-[10.5px] sm:text-xs font-bold ios-press"
            title="Suwaseriya 24/7 Free National Ambulance (1990)"
          >
            <HeartPulse size={12} className="text-emerald-400 shrink-0" />
            <span>1990</span>
            <span className="text-[9.5px] text-slate-400 font-sans hidden xs:inline">Ambulance</span>
          </a>

          {/* 119 Police */}
          <a
            href="tel:119"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-colors tabular-nums font-mono text-[10.5px] sm:text-xs font-bold ios-press"
            title="Police Emergency Assistance (119)"
          >
            <Radio size={12} className="text-sky-400 shrink-0" />
            <span>119</span>
            <span className="text-[9.5px] text-slate-400 font-sans hidden xs:inline">Police</span>
          </a>
        </div>
      </div>
    </div>
  );
}
