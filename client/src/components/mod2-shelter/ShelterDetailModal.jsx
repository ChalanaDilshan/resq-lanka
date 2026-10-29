import {
  X,
  MapPin,
  Users,
  Phone,
  Mail,
  Navigation,
  Sliders,
  ExternalLink,
  History,
  Info,
  ShieldCheck,
} from 'lucide-react';
import HazardBadge from './HazardBadge';
import { timeAgo } from '../../utils/timeAgo';

export default function ShelterDetailModal({
  shelter,
  onClose,
  onOpenOccupancyModal,
  isCoordinator,
}) {
  if (!shelter) return null;

  const isClosed = shelter.status === 'Closed';
  const current = shelter.capacityCurrent || 0;
  const total = shelter.capacityTotal || 1;
  const available = isClosed ? 0 : Math.max(0, total - current);
  const percentage = Math.min(100, Math.round((current / total) * 100));

  const isFlood = shelter.hazardType === 'flood';
  const isEarthquake = shelter.hazardType === 'earthquake';

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shelter.name}, ${shelter.address}, Sri Lanka`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with media banner */}
        <div className="relative h-52 bg-slate-900 shrink-0 overflow-hidden">
          {shelter.image ? (
            <img
              src={shelter.image}
              alt={shelter.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-white z-10"
            aria-label="Close shelter file"
          >
            <X size={18} />
          </button>

          {/* Badges on image (Crisp, High-Contrast) */}
          <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/90 text-slate-100 border border-slate-700">
              <ShieldCheck size={13} className="text-sky-400 shrink-0" />
              <span>DMC Verified Safe Haven</span>
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                isClosed
                  ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700'
              }`}
            >
              {isClosed ? 'Facility Closed' : 'Emergency Operations Protocol'}
            </span>
          </div>

          {/* Shelter title and hazard badge */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="mb-1.5">
              <HazardBadge
                hazardType={shelter.hazardType}
                elevationMeters={shelter.elevationMeters}
                clearanceRadiusMeters={shelter.clearanceRadiusMeters}
                size="md"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug drop-shadow-xs">
              {shelter.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
              <MapPin size={13} className="text-rose-400 shrink-0" />
              <span>{shelter.address}, {shelter.district}</span>
            </div>
          </div>
        </div>

        {/* Modal scrollable body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-700">
          {/* Facility Closed Notice Banner */}
          {isClosed && (
            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 text-xs flex items-center gap-2.5">
              <Info size={18} className="text-slate-600 shrink-0" />
              <div>
                <strong className="block font-semibold">Facility Currently Closed</strong>
                <span>New emergency admissions to this safe haven are suspended by relief coordinators.</span>
              </div>
            </div>
          )}

          {/* Real-time Occupancy & Capacity Meter */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  Live Shelter Intake & Capacity
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {current} / {total} people
              </span>
            </div>

            {/* Gauge */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  isClosed
                    ? 'bg-slate-400'
                    : percentage >= 100
                    ? 'bg-rose-600'
                    : percentage >= 85
                    ? 'bg-amber-500'
                    : 'bg-green-600'
                } rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-1.5 text-xs font-medium">
              <span className="text-slate-500">
                {isClosed ? 'Intake Closed' : `${percentage}% Occupied`}
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
                  ? `${available} spaces available`
                  : 'Full capacity reached'}
              </span>
            </div>
          </div>

          {/* Hazard Vulnerability & Suitability Explanation */}
          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
              isFlood
                ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                : isEarthquake
                ? 'bg-stone-50 border-stone-200 text-stone-900'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Info size={15} className="shrink-0" />
              <span>
                {isFlood
                  ? 'High-Ground Inundation Safety Profile'
                  : isEarthquake
                  ? 'Open Seismic Ground Safety Profile'
                  : 'Civil Defense Suitability'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              {isFlood
                ? `This site is elevated at +${
                    shelter.elevationMeters || 35
                  }m above the regional flood plain. It provides certified vertical evacuation protection against severe riverine inundations, flash floods, and storm runoffs.`
                : isEarthquake
                ? `This site maintains a minimum ${
                    shelter.clearanceRadiusMeters || 120
                  }m clearance buffer away from high-rise buildings, masonry walls, overhead electric grids, and falling structural debris during seismic tremors.`
                : 'Designated multi-hazard emergency safe haven under DMC emergency operations.'}
            </p>
          </div>

          {/* Operational Notes */}
          {shelter.notes && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">
                Operational Notes & Instructions
              </h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {shelter.notes}
              </p>
            </div>
          )}

          {/* Facilities & Amenities Checklist */}
          {shelter.facilities && shelter.facilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Available Facilities & Infrastructure
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shelter.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 flex items-center gap-2"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-slate-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="truncate">{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinator in charge */}
          {shelter.coordinator && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Designated Relief Coordinator
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
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
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <Phone size={13} />
                    <span>Call Coordinator</span>
                  </a>
                )}
                {shelter.coordinator.email && (
                  <a
                    href={`mailto:${shelter.coordinator.email}`}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-slate-900"
                    title={shelter.coordinator.email}
                  >
                    <Mail size={14} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Occupancy History Logs */}
          {shelter.occupancyHistory && shelter.occupancyHistory.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History size={14} className="text-slate-400" />
                <span>Capacity & Occupancy Log History</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {shelter.occupancyHistory.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2 bg-slate-50 rounded-md border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {log.changeDelta >= 0 ? `+${log.changeDelta}` : log.changeDelta} occupants
                      </span>{' '}
                      <span className="text-slate-500 font-mono text-[11px]">
                        (Now {log.newOccupancy} / {log.newCapacity || shelter.capacityTotal})
                      </span>
                      {log.note && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.note}</p>
                      )}
                    </div>
                    <div className="text-right text-[10px] text-slate-500 shrink-0">
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
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Navigation size={13} className="text-slate-600" />
            <span>Open Maps Directions</span>
            <ExternalLink size={11} className="text-slate-400" />
          </a>

          <div className="flex items-center gap-2">
            {isCoordinator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOccupancyModal(shelter);
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <Sliders size={13} />
                <span>Edit Capacity & Occupancy</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
