import {
  MapPin,
  Users,
  Phone,
  ShieldCheck,
  Sliders,
  ArrowUpRight,
} from 'lucide-react';
import HazardBadge from './HazardBadge';

export default function ShelterCard({
  shelter,
  onOpenOccupancyModal,
  onSelectShelter,
  isCoordinator,
}) {
  const isClosed = shelter.status === 'Closed';
  const current = shelter.capacityCurrent || 0;
  const total = shelter.capacityTotal || 1;
  const available = isClosed ? 0 : Math.max(0, total - current);
  const percentage = Math.min(100, Math.round((current / total) * 100));

  const getStatusBadge = () => {
    if (isClosed) {
      return {
        label: 'Shelter Closed',
        classes: 'bg-slate-900/90 text-slate-300 border-slate-700',
        dot: 'bg-slate-400',
      };
    }
    if (percentage >= 100) {
      return {
        label: 'At Maximum Capacity',
        classes: 'bg-rose-950/90 text-rose-200 border-rose-800',
        dot: 'bg-rose-500',
      };
    }
    if (percentage >= 85) {
      return {
        label: 'Nearly Full (≥85%)',
        classes: 'bg-amber-950/90 text-amber-200 border-amber-800',
        dot: 'bg-amber-400',
      };
    }
    return {
      label: 'Spaces Available',
      classes: 'bg-slate-900/90 text-slate-100 border-slate-700',
      dot: 'bg-green-500',
    };
  };

  const getProgressBarColor = () => {
    if (isClosed) return 'bg-slate-400';
    if (percentage >= 100) return 'bg-rose-600';
    if (percentage >= 85) return 'bg-amber-500';
    return 'bg-green-600';
  };

  const status = getStatusBadge();

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Media / Header Area */}
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        {shelter.image ? (
          <img
            src={shelter.image}
            alt={shelter.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6 text-center text-white">
            <div>
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="font-semibold text-xs tracking-normal text-slate-300">
                Verified Safe Haven
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges (Crisp, High-Contrast, No Blur) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Verified Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/90 text-slate-200 border border-slate-700/80">
            <ShieldCheck size={13} className="text-sky-400 shrink-0" />
            <span>DMC Certified</span>
          </span>

          {/* Operational Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${status.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
          </span>
        </div>

        {/* Bottom Location & Shelter Name */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-base sm:text-lg leading-snug drop-shadow-xs truncate">
            {shelter.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
            <MapPin size={13} className="text-rose-400 shrink-0" />
            <span className="truncate">{shelter.address}, {shelter.district}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Hazard Badge & Description */}
        <div>
          <div className="mb-2">
            <HazardBadge
              hazardType={shelter.hazardType}
              elevationMeters={shelter.elevationMeters}
              clearanceRadiusMeters={shelter.clearanceRadiusMeters}
              size="sm"
            />
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {shelter.notes || 'Designated relief and safe haven facility under DMC response framework.'}
          </p>
        </div>

        {/* Real-time Occupancy & Vacancy Bar */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users size={14} className="text-slate-500" />
              <span>Current Intake</span>
            </div>
            <div className="font-bold text-slate-900 font-mono text-xs">
              {current} <span className="font-normal text-slate-500">/ {total} capacity</span>
            </div>
          </div>

          {/* Linear Progress Meter */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressBarColor()} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mt-1.5 font-medium">
            <span className="text-slate-500">
              {isClosed ? 'Facility Closed' : `${percentage}% Occupied`}
            </span>
            <span
              className={
                isClosed
                  ? 'text-slate-600 font-semibold'
                  : available > 0
                  ? 'text-green-800 font-semibold'
                  : 'text-rose-700 font-semibold'
              }
            >
              {isClosed
                ? 'Intake Suspended'
                : available > 0
                ? `${available} spaces free`
                : 'No spaces free'}
            </span>
          </div>
        </div>

        {/* Facilities Chips */}
        {shelter.facilities && shelter.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shelter.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium"
              >
                {f}
              </span>
            ))}
            {shelter.facilities.length > 3 && (
              <span className="px-2 py-0.5 text-[11px] bg-slate-50 text-slate-600 rounded border border-slate-200 font-semibold">
                +{shelter.facilities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Coordinator Info */}
        {shelter.coordinator && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="truncate mr-2">
              <span className="text-[10px] text-slate-500 block font-medium">
                Coordinator in charge
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {shelter.coordinator.name}
              </span>
            </div>
            {shelter.coordinator.phone && (
              <a
                href={`tel:${shelter.coordinator.phone}`}
                className="shrink-0 p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition focus-visible:ring-2 focus-visible:ring-slate-900"
                title={`Call coordinator: ${shelter.coordinator.phone}`}
                aria-label={`Call coordinator: ${shelter.coordinator.phone}`}
              >
                <Phone size={14} />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {/* View Details */}
          <button
            type="button"
            onClick={() => onSelectShelter(shelter)}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-900"
          >
            <span>View Details</span>
            <ArrowUpRight size={13} className="text-slate-400" />
          </button>

          {/* Coordinator Edit Occupancy */}
          {isCoordinator && (
            <button
              type="button"
              onClick={() => onOpenOccupancyModal(shelter)}
              className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-900"
              title="Update shelter capacity and current occupancy numbers"
            >
              <Sliders size={13} className="text-slate-600" />
              <span>Update</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
