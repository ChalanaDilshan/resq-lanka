import { Waves, Mountain, ShieldCheck, TreePine, AlertTriangle } from 'lucide-react';

export default function HazardBadge({
  hazardType,
  elevationMeters,
  clearanceRadiusMeters,
  size = 'md',
}) {
  const isFlood = hazardType === 'flood';
  const isEarthquake = hazardType === 'earthquake';

  if (isFlood) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } bg-sky-50 text-sky-900 border border-sky-300/80 shadow-xs`}
        >
          <Waves className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sky-700 shrink-0`} />
          <span>High-Ground Facility (Floods)</span>
        </span>
        {elevationMeters && (
          <span
            className={`inline-flex items-center gap-1 font-medium rounded-md ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            } bg-slate-100 text-slate-800 border border-slate-300 font-mono`}
            title="Elevation above regional flood plain level"
          >
            <Mountain className="w-3 h-3 text-slate-600 shrink-0" />
            <span>+{elevationMeters}m ASL</span>
          </span>
        )}
      </div>
    );
  }

  if (isEarthquake) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } bg-stone-100 text-stone-900 border border-stone-300 shadow-xs`}
        >
          <TreePine className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-stone-700 shrink-0`} />
          <span>Open Assembly Ground (Earthquakes)</span>
        </span>
        {clearanceRadiusMeters && (
          <span
            className={`inline-flex items-center gap-1 font-medium rounded-md ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            } bg-stone-50 text-stone-800 border border-stone-200 font-mono`}
            title="Structural debris clearance buffer radius from high-rise buildings"
          >
            <ShieldCheck className="w-3 h-3 text-stone-600 shrink-0" />
            <span>{clearanceRadiusMeters}m Clearance</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } bg-slate-100 text-slate-800 border border-slate-300`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
      <span className="capitalize">{hazardType || 'Multi-Hazard'} Refuge</span>
    </span>
  );
}
