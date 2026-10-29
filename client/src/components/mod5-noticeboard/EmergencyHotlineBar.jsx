import { Phone, ShieldAlert, Radio, HeartPulse, Building2 } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '../../utils/noticeConstants';

export default function EmergencyHotlineBar() {
  const getHotlineIcon = (number) => {
    switch (number) {
      case '117':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case '1990':
        return <HeartPulse className="w-3.5 h-3.5 text-green-400" />;
      case '119':
        return <Radio className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-white">Sri Lanka Emergency Hotlines:</span>
          <span className="hidden lg:inline text-slate-400 font-normal">
            For critical, life-threatening incidents, contact national emergency dispatch directly:
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {EMERGENCY_HOTLINES.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                hotline.primary
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title={`${hotline.name}: ${hotline.description}`}
            >
              {getHotlineIcon(hotline.number)}
              <span className="text-slate-300 font-normal">{hotline.name.split(' ')[0]}:</span>
              <span className="text-amber-400 font-bold">{hotline.number}</span>
              <Phone className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
