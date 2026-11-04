import { Building2, Waves, TreePine, Users, ShieldCheck } from 'lucide-react';

export default function ShelterStatsBanner({ stats }) {
  if (!stats) return null;

  const occupancyRate =
    stats.totalCapacity > 0
      ? Math.min(100, Math.round((stats.totalOccupancy / stats.totalCapacity) * 100))
      : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Top operational bar */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          <span className="font-semibold tracking-normal text-slate-200">
            DMC Emergency Operations • National Safe Haven Census
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Certified under Sri Lanka Disaster Management Act No. 13
        </div>
      </div>

      {/* Metric columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Verified Safe Shelters */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold text-slate-600">
              Verified Shelters
            </span>
            <Building2 size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalShelters}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
            <ShieldCheck size={13} className="text-slate-700 shrink-0" />
            <span>100% DMC Certified Safe</span>
          </div>
        </div>

        {/* Metric 2: Flood Facilities */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold text-slate-600">
              Flood Havens
            </span>
            <Waves size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.floodShelters}
          </div>
          <div className="text-xs text-slate-600 mt-1 font-medium">
            High-ground vertical evacuation
          </div>
        </div>

        {/* Metric 3: Earthquake Assembly Grounds */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold text-slate-600">
              Earthquake Grounds
            </span>
            <TreePine size={16} className="text-stone-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.earthquakeShelters}
          </div>
          <div className="text-xs text-slate-600 mt-1 font-medium">
            Structural debris clearance zones
          </div>
        </div>

        {/* Metric 4: Real-time Capacity & Vacancies */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold text-slate-600">
              Free Intake Capacity
            </span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.availableSpaces}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {stats.totalCapacity} beds
            </span>
          </div>

          {/* Integrated linear progress meter */}
          <div className="mt-2 space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  occupancyRate >= 90
                    ? 'bg-rose-600'
                    : occupancyRate >= 75
                    ? 'bg-amber-500'
                    : 'bg-green-600'
                }`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{occupancyRate}% occupied</span>
              <span>{stats.totalOccupancy} sheltered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
