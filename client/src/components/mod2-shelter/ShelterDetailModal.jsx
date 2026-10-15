import {
  X,
  MapPin,
  Users,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sliders,
  ExternalLink,
  History,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import HazardBadge from './HazardBadge';
import { timeAgo } from '../../utils/timeAgo';

export default function ShelterDetailModal({
  shelter,
  onClose,
  onOpenOccupancyModal,
  isCoordinator,
  onSwitchToCoordinator,
}) {
  if (!shelter) return null;

  const current = shelter.capacityCurrent || 0;
  const total = shelter.capacityTotal || 1;
  const available = Math.max(0, total - current);
  const percentage = Math.round((current / total) * 100);

  const isFlood = shelter.hazardType === 'flood';
  const isEarthquake = shelter.hazardType === 'earthquake';

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shelter.name}, ${shelter.address}, Sri Lanka`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with media banner */}
        <div className="relative h-56 bg-slate-900 shrink-0 overflow-hidden">
          {shelter.image ? (
            <img
              src={shelter.image}
              alt={shelter.name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 to-blue-950 flex items-center justify-center text-white" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full backdrop-blur-sm transition z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/95 text-emerald-800 backdrop-blur-md shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-100" />
              <span>Verified Safe Haven</span>
            </span>
            <span className="text-xs font-bold text-white/90 bg-slate-900/70 px-2.5 py-1 rounded-full backdrop-blur-md">
              DMC Protocol
            </span>
          </div>

          {/* Shelter title and hazard badge */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="mb-2">
              <HazardBadge
                hazardType={shelter.hazardType}
                elevationMeters={shelter.elevationMeters}
                clearanceRadiusMeters={shelter.clearanceRadiusMeters}
                size="md"
              />
            </div>
            <h2 className="text-2xl font-black leading-tight drop-shadow-md">
              {shelter.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-1">
              <MapPin size={14} className="text-red-400 shrink-0" />
              <span>{shelter.address}, {shelter.district}</span>
            </div>
          </div>
        </div>

        {/* Modal scrollable body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Real-time Occupancy & Capacity Meter */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Shelter Occupancy & Capacity
                </span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {current} / {total} people
              </span>
            </div>

            {/* Gauge */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  percentage >= 100
                    ? 'bg-red-500'
                    : percentage >= 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                } rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs font-semibold">
              <span className="text-slate-500">{percentage}% Occupied</span>
              <span className={available > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                {available > 0 ? `${available} spaces available` : 'Full capacity reached'}
              </span>
            </div>
          </div>

          {/* Hazard Vulnerability & Suitability Explanation */}
          <div
            className={`p-4 rounded-2xl border ${
              isFlood
                ? 'bg-cyan-50/60 border-cyan-200 text-cyan-950'
                : isEarthquake
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm mb-1.5">
              <Info size={16} />
              <span>
                {isFlood
                  ? 'Why High-Ground Facility for Floods?'
                  : isEarthquake
                  ? 'Why Open Assembly Ground for Earthquakes?'
                  : 'Hazard Response Suitability'}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {isFlood
                ? `This site is located at an elevation of +${
                    shelter.elevationMeters || 35
                  }m above the regional flood plain. It provides certified vertical evacuation protection against severe riverine inundations, flash floods, and storm runoffs.`
                : isEarthquake
                ? `This site offers a minimum ${
                    shelter.clearanceRadiusMeters || 120
                  }m clearance buffer away from high-rise buildings, masonry walls, overhead electric grids, and falling structural hazards during seismic events.`
                : 'Designated multi-hazard emergency safe haven.'}
            </p>
          </div>

          {/* Operational Notes */}
          {shelter.notes && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Shelter Information & Notes
              </h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                {shelter.notes}
              </p>
            </div>
          )}

          {/* Facilities & Amenities Checklist */}
          {shelter.facilities && shelter.facilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Available Facilities & Infrastructure
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shelter.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinator In Charge */}
          {shelter.coordinator && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Shelter Coordinator
                </span>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {shelter.coordinator.name}
                </div>
                <div className="text-xs text-slate-500">
                  {shelter.coordinator.designation || 'Relief Center Administrator'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {shelter.coordinator.phone && (
                  <a
                    href={`tel:${shelter.coordinator.phone}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call Coordinator</span>
                  </a>
                )}
                {shelter.coordinator.email && (
                  <a
                    href={`mailto:${shelter.coordinator.email}`}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
                    title={shelter.coordinator.email}
                  >
                    <Mail size={15} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Occupancy History Logs */}
          {shelter.occupancyHistory && shelter.occupancyHistory.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
                <History size={14} className="text-slate-400" />
                <span>Coordinator Capacity & Occupancy Log History</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {shelter.occupancyHistory.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        {log.changeDelta >= 0 ? `+${log.changeDelta}` : log.changeDelta} occupants
                      </span>{' '}
                      <span className="text-slate-500">
                        (Now {log.newOccupancy} / {log.newCapacity || shelter.capacityTotal})
                      </span>
                      {log.note && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.note}</p>
                      )}
                    </div>
                    <div className="text-right text-[10px] text-slate-400 shrink-0">
                      <div>{timeAgo(log.timestamp)}</div>
                      <div className="truncate max-w-[120px]">{log.updatedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Navigation size={14} className="text-blue-600" />
            <span>Open Directions in Maps</span>
            <ExternalLink size={12} className="text-slate-400" />
          </a>

          <div className="flex items-center gap-2">
            {isCoordinator ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOccupancyModal(shelter);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Sliders size={14} />
                <span>Edit Capacity & Occupancy</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToCoordinator();
                }}
                className="px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
              >
                Switch to Coordinator
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
