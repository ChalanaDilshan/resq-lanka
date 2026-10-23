import { Phone, Shield, Radio, HeartPulse, Building2 } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '../../utils/noticeConstants';

export default function EmergencyHotlineBar() {
  const getHotlineIcon = (number) => {
    switch (number) {
      case '117':
        return <Shield className="w-4 h-4 text-red-500" />;
      case '1990':
        return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      case '119':
        return <Radio className="w-4 h-4 text-blue-500" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 sm:px-6 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="uppercase tracking-wider text-white">Sri Lanka Emergency Hotlines:</span>
          <span className="hidden lg:inline text-slate-400 font-normal">
            For life-threatening emergencies, call national first responders immediately:
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {EMERGENCY_HOTLINES.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                hotline.primary
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title={`${hotline.name}: ${hotline.description}`}
            >
              {getHotlineIcon(hotline.number)}
              <span className="text-slate-300 font-medium">{hotline.name.split(' ')[0]}:</span>
              <span className="text-amber-400 font-extrabold tracking-wide">{hotline.number}</span>
              <Phone className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
