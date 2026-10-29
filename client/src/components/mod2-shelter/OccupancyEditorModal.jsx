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
    if (percentage >= 100) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (percentage >= 85) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-green-800 bg-green-50 border-green-200';
  };

  const getProgressBarColor = () => {
    if (isClosed) return 'bg-slate-400';
    if (percentage >= 100) return 'bg-rose-600';
    if (percentage >= 85) return 'bg-amber-500';
    return 'bg-green-600';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 text-white">
                <ShieldCheck size={12} />
                Coordinator Control
              </span>
              <HazardBadge
                hazardType={shelter.hazardType}
                elevationMeters={shelter.elevationMeters}
                clearanceRadiusMeters={shelter.clearanceRadiusMeters}
                size="sm"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Update Shelter Capacity & Intake
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {shelter.name} • {shelter.district} District
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2 font-medium">
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Occupancy Gauge Card */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Live Intake Gauge
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusColor()}`}>
                  {percentage}% Full
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-600">
                {availableSpaces} spaces available
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${getProgressBarColor()} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            {percentage >= 95 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                <AlertTriangle size={13} />
                <span>Shelter is reaching maximum safe operational threshold.</span>
              </div>
            )}
          </div>

          {/* Current Occupancy Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users size={14} className="text-slate-600" />
                <span>Current Occupancy (People Sheltered)</span>
              </label>
              <span className="text-xs text-slate-500">
                Previous: <strong className="text-slate-800 font-mono">{shelter.capacityCurrent}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min="0"
                value={occupancy}
                onChange={(e) => setOccupancy(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-28 px-3 py-2 text-base font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-center"
              />

              {/* Quick Stepper Buttons */}
              <div className="flex flex-wrap gap-1 items-center">
                {[-10, -5, -1, +1, +5, +10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleAdjustOccupancy(delta)}
                    className="px-2 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Capacity Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building size={14} className="text-slate-600" />
                <span>Total Capacity (Maximum Authorized Intake)</span>
              </label>
              <span className="text-xs text-slate-500">
                Previous: <strong className="text-slate-800 font-mono">{shelter.capacityTotal}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-28 px-3 py-2 text-base font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-center"
              />

              {/* Quick Expand Capacity Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustCapacity(25)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
                  title="Expand capacity by 25 (e.g. extra tents erected)"
                >
                  +25 (Annex Hall)
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCapacity(50)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
                  title="Expand capacity by 50 (e.g. secondary ground opened)"
                >
                  +50 (Field Tents)
                </button>
              </div>
            </div>
          </div>

          {/* Operational Status Control */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
            >
              <option value="Available">Available (Open and accepting evacuees)</option>
              <option value="Nearly Full">Nearly Full (Occupancy ≥ 85%)</option>
              <option value="At Capacity">At Capacity (100% full)</option>
              <option value="Closed">Closed (Intake suspended / deactivated)</option>
            </select>
          </div>

          {/* Update Reason / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Operational Reason / Log Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 15 families checked in from Kalmunai flood zone; medical camp deployed."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800"
            />
          </div>

          {/* Recent Occupancy Audit Trail */}
          {shelter.occupancyHistory && shelter.occupancyHistory.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History size={13} className="text-slate-400" />
                <span>Recent Intake Audit Trail</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {shelter.occupancyHistory.slice(0, 4).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2 bg-slate-50 rounded-md border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {log.changeDelta >= 0 ? (
                          <span className="inline-flex items-center text-slate-900 font-bold">
                            <TrendingUp size={12} className="mr-0.5 text-slate-600" />
                            +{log.changeDelta}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-700 font-bold">
                            <TrendingDown size={12} className="mr-0.5 text-slate-500" />
                            {log.changeDelta}
                          </span>
                        )}
                        <span>people • {log.newOccupancy} / {log.newCapacity || shelter.capacityTotal} total</span>
                      </div>
                      {log.note && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.note}</p>
                      )}
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
          <div className="border-t border-slate-200 pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
