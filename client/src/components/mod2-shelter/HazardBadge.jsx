import { Waves, Mountain, ShieldCheck, TreePine, AlertTriangle } from 'lucide-react';

export default function HazardBadge({ hazardType, elevationMeters, clearanceRadiusMeters, size = 'md' }) {
  const isFlood = hazardType === 'flood';
  const isEarthquake = hazardType === 'earthquake';

  if (isFlood) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[11px]'
              : 'px-2.5 py-1 text-xs'
          } bg-cyan-50 text-cyan-800 border border-cyan-200/80 shadow-xs`}
        >
          <Waves className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-cyan-600`} />
          <span>High-Ground Facility (Floods)</span>
        </span>
        {elevationMeters && (
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-lg ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            } bg-blue-50 text-blue-700 border border-blue-100`}
            title="Elevation above flood plain level"
          >
            <Mountain className="w-3 h-3 text-blue-500" />
            <span>+{elevationMeters}m Elevation</span>
          </span>
        )}
      </div>
    );
  }

  if (isEarthquake) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[11px]'
              : 'px-2.5 py-1 text-xs'
          } bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs`}
        >
          <TreePine className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600`} />
          <span>Open Assembly Ground (Earthquakes)</span>
        </span>
        {clearanceRadiusMeters && (
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-lg ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            } bg-amber-50 text-amber-800 border border-amber-200/70`}
            title="Debris clearance buffer radius from tall structures"
          >
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>{clearanceRadiusMeters}m Debris Clearance</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } bg-slate-100 text-slate-700 border border-slate-200`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
      <span className="capitalize">{hazardType || 'Multi-Hazard'} Refuge</span>
    </span>
  );
}
