import { useState } from 'react';
import {
  X,
  Users,
  Building,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Save,
  ShieldCheck,
} from 'lucide-react';
import HazardBadge from './HazardBadge';
import { timeAgo } from '../../utils/timeAgo';

export default function OccupancyEditorModal({ shelter, onClose, onSave, coordinatorUser }) {
  const [occupancy, setOccupancy] = useState(shelter.capacityCurrent || 0);
  const [capacity, setCapacity] = useState(shelter.capacityTotal || 100);
  const [status, setStatus] = useState(shelter.status || 'Available');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isClosed = status === 'Closed';
  const availableSpaces = isClosed ? 0 : Math.max(0, capacity - occupancy);
  const percentage = capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0;

  const getStatusColor = () => {
    if (isClosed) return 'text-slate-700 bg-slate-100 border-slate-300';
    if (percentage >= 100) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 85) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getProgressBarColor = () => {
    if (isClosed) return 'bg-slate-400';
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 85) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleAdjustOccupancy = (delta) => {
    setOccupancy((prev) => Math.max(0, prev + delta));
  };

  const handleAdjustCapacity = (delta) => {
    setCapacity((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedOcc = parseInt(occupancy, 10);
    const parsedCap = parseInt(capacity, 10);

    if (isNaN(parsedCap) || parsedCap <= 0) {
      setErrorMsg('Total capacity must be at least 1 person.');
      return;
    }

    if (isNaN(parsedOcc) || parsedOcc < 0) {
      setErrorMsg('Occupancy cannot be negative.');
      return;
    }

    if (parsedOcc > parsedCap) {
      setErrorMsg(`Current occupancy (${parsedOcc}) cannot exceed total capacity (${parsedCap}).`);
      return;
    }

    try {
      setSaving(true);
      await onSave(shelter._id || shelter.id, {
        capacityCurrent: parsedOcc,
        capacityTotal: parsedCap,
        status,
        note: note.trim() || undefined,
        updatedBy: coordinatorUser?.name
          ? `${coordinatorUser.name} (${coordinatorUser.roleLabel || coordinatorUser.role || 'Administrator'})`
          : 'Authorized Coordinator',
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update shelter occupancy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-emerald-50/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <ShieldCheck size={12} className="stroke-[2.5]" />
                Coordinator Control
              </span>
              <HazardBadge
                hazardType={shelter.hazardType}
                elevationMeters={shelter.elevationMeters}
                clearanceRadiusMeters={shelter.clearanceRadiusMeters}
                size="sm"
              />
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Update Shelter Capacity & Occupancy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {shelter.name} • {shelter.district}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Occupancy Gauge Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Live Occupancy Gauge
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusColor()}`}>
                  {percentage}% Full
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {availableSpaces} spaces available
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${getProgressBarColor()} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            {percentage >= 95 && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertTriangle size={14} />
                <span>Shelter is reaching maximum safe operational threshold!</span>
              </div>
            )}
          </div>

          {/* Current Occupancy Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={15} className="text-blue-600" />
                <span>Current Occupancy (People inside shelter)</span>
              </label>
              <span className="text-xs font-medium text-slate-500">
                Was: <strong className="text-slate-800">{shelter.capacityCurrent}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={occupancy}
                onChange={(e) => setOccupancy(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-32 px-3.5 py-2.5 text-lg font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-center"
              />

              {/* Quick Stepper Buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {[-10, -5, -1, +1, +5, +10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleAdjustOccupancy(delta)}
                    className={`px-2.5 py-2 text-xs font-bold rounded-lg border transition ${
                      delta > 0
                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Capacity Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={15} className="text-emerald-600" />
                <span>Total Shelter Capacity (Maximum authorized intake)</span>
              </label>
              <span className="text-xs font-medium text-slate-500">
                Was: <strong className="text-slate-800">{shelter.capacityTotal}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-32 px-3.5 py-2.5 text-lg font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-center"
              />

              {/* Quick Expand Capacity Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustCapacity(25)}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                  title="Expand capacity by 25 (e.g. extra tents erected)"
                >
                  +25 (Expand Hall)
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCapacity(50)}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                  title="Expand capacity by 50 (e.g. secondary ground opened)"
                >
                  +50 (Add Field Tents)
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Increase total capacity if relief tents or school annex halls are made operational.
            </p>
          </div>

          {/* Operational Status Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-800"
            >
              <option value="Available">Available (Open & accepting evacuees)</option>
              <option value="Nearly Full">Nearly Full (Occupancy ≥ 85%)</option>
              <option value="At Capacity">At Capacity (100% full)</option>
              <option value="Closed">Closed (Intake suspended / facility deactivated)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Marking as Closed designates the facility as inactive and prevents incoming evacuees.
            </p>
          </div>

          {/* Update Reason / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Update Reason / Operational Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 15 families checked in from Kalmunai flooded wards; 2 medical tents set up."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Recent Occupancy Audit Trail */}
          {shelter.occupancyHistory && shelter.occupancyHistory.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History size={14} className="text-slate-400" />
                <span>Recent Capacity & Occupancy Log</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {shelter.occupancyHistory.slice(0, 4).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {log.changeDelta >= 0 ? (
                          <span className="inline-flex items-center text-blue-600 font-bold">
                            <TrendingUp size={13} className="mr-0.5" />
                            +{log.changeDelta}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600 font-bold">
                            <TrendingDown size={13} className="mr-0.5" />
                            {log.changeDelta}
                          </span>
                        )}
                        <span>people • Now at {log.newOccupancy} / {log.newCapacity || shelter.capacityTotal}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.note || 'Occupancy adjustment'}
                      </p>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 shrink-0">
                      <div>{timeAgo(log.timestamp)}</div>
                      <div className="truncate max-w-[110px]">{log.updatedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Capacity & Occupancy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
