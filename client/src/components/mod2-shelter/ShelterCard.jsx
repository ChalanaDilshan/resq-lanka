import {
  MapPin,
  Users,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sliders,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import HazardBadge from './HazardBadge';

export default function ShelterCard({
  shelter,
  onOpenOccupancyModal,
  onSelectShelter,
  isCoordinator,
  onSwitchToCoordinator,
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
        classes: 'bg-slate-500/10 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
    }
    if (percentage >= 100) {
      return {
        label: 'At Maximum Capacity',
        classes: 'bg-red-500/10 text-red-700 border-red-200',
        dot: 'bg-red-500',
      };
    }
    if (percentage >= 85) {
      return {
        label: 'Nearly Full',
        classes: 'bg-amber-500/10 text-amber-800 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
      };
    }
    return {
      label: 'Spaces Available',
      classes: 'bg-emerald-500/10 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  };

  const getProgressColor = () => {
    if (isClosed) return 'bg-slate-400';
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 85) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Media / Header Area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {shelter.image ? (
          <img
            src={shelter.image}
            alt={shelter.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6 text-center text-white">
            <div>
              <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-sm tracking-wide">Verified Safe Haven</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Verified Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 text-emerald-800 backdrop-blur-md shadow-xs border border-emerald-100">
            <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-100" />
            <span>Verified Shelter</span>
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border bg-white/95 ${status.classes}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
          </span>
        </div>

        {/* Bottom Floating Hazard Badge & Location */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="mb-1.5">
            <HazardBadge
              hazardType={shelter.hazardType}
              elevationMeters={shelter.elevationMeters}
              clearanceRadiusMeters={shelter.clearanceRadiusMeters}
              size="sm"
            />
          </div>
          <h4 className="text-white font-extrabold text-lg leading-tight drop-shadow-sm truncate">
            {shelter.name}
          </h4>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* District & Address */}
        <div>
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2">
            <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{shelter.address}, {shelter.district}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {shelter.notes || 'Designated relief and safe haven facility under DMC response framework.'}
          </p>
        </div>

        {/* Capacity & Occupancy Bar */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Users size={14} className="text-blue-600" />
              <span>Occupancy</span>
            </div>
            <div className="font-extrabold text-slate-900">
              {current} <span className="font-normal text-slate-500">/ {total} capacity</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2 font-semibold">
            <span className="text-slate-500">
              {isClosed ? 'Facility Closed' : `${percentage}% Occupied`}
            </span>
            <span
              className={
                isClosed
                  ? 'text-slate-600 font-bold'
                  : available > 0
                  ? 'text-emerald-700 font-bold'
                  : 'text-red-600 font-bold'
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

        {/* Key Facilities Badges */}
        {shelter.facilities && shelter.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shelter.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-lg font-medium"
              >
                {f}
              </span>
            ))}
            {shelter.facilities.length > 3 && (
              <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-500 rounded-lg font-semibold">
                +{shelter.facilities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Coordinator Info */}
        {shelter.coordinator && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="truncate mr-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                Coordinator In Charge
              </span>
              <span className="font-bold text-slate-800 truncate block">
                {shelter.coordinator.name}
              </span>
            </div>
            {shelter.coordinator.phone && (
              <a
                href={`tel:${shelter.coordinator.phone}`}
                className="shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-blue-100 transition"
                title={`Call ${shelter.coordinator.phone}`}
              >
                <Phone size={14} />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          {/* Details Button */}
          <button
            type="button"
            onClick={() => onSelectShelter(shelter)}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ExternalLink size={13} />
          </button>

          {/* Coordinator Edit Occupancy Button */}
          {isCoordinator ? (
            <button
              type="button"
              onClick={() => onOpenOccupancyModal(shelter)}
              className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 shrink-0"
              title="Update shelter capacity and current occupancy numbers"
            >
              <Sliders size={14} />
              <span>Update Occupancy</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSwitchToCoordinator}
              className="py-2.5 px-2.5 text-[11px] text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold transition"
              title="Switch role to Coordinator to edit capacity"
            >
              Coordinator Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
