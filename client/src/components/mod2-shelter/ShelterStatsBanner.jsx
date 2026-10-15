import { Building2, Waves, TreePine, Users, CheckCircle2 } from 'lucide-react';

export default function ShelterStatsBanner({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {/* Stat 1: Total Verified Shelters */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Shelters
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 size={17} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900">
          {stats.totalShelters}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
          <CheckCircle2 size={13} />
          <span>100% DMC Certified</span>
        </div>
      </div>

      {/* Stat 2: High-Ground Facilities for Floods */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Flood Havens
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Waves size={17} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-cyan-900">
          {stats.floodShelters}
        </div>
        <div className="text-[11px] font-semibold text-cyan-700 mt-1">
          High-Ground Facilities
        </div>
      </div>

      {/* Stat 3: Open Assembly Grounds for Earthquakes */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Earthquake Havens
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TreePine size={17} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-900">
          {stats.earthquakeShelters}
        </div>
        <div className="text-[11px] font-semibold text-emerald-700 mt-1">
          Open Assembly Grounds
        </div>
      </div>

      {/* Stat 4: Available Spaces & Overall Occupancy */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Safe Spaces Free
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={17} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900">
          {stats.availableSpaces}
        </div>
        <div className="text-[11px] font-semibold text-slate-500 mt-1">
          {stats.totalOccupancy} / {stats.totalCapacity} people sheltering
        </div>
      </div>
    </div>
  );
}
