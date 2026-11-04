import { useState } from 'react';
import {
  X,
  PlusCircle,
  Waves,
  TreePine,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AddShelterModal({ onClose, onAdd, coordinatorUser }) {
  const [formData, setFormData] = useState({
    name: '',
    hazardType: 'flood', // 'flood' | 'earthquake'
    capacityTotal: 200,
    capacityCurrent: 0,
    district: coordinatorUser?.district?.replace(' District', '') || 'Ampara',
    address: '',
    elevationMeters: 35,
    clearanceRadiusMeters: 100,
    coordinatorName: coordinatorUser?.name || 'Authorized Coordinator',
    coordinatorPhone: '+94 63 222 2341',
    coordinatorEmail: coordinatorUser?.email || 'coordinator@resqlanka.lk',
    facilities: ['Clean Drinking Water', 'First Aid Station', 'Sanitation Units'],
    notes: '',
  });

  const [customFacility, setCustomFacility] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const standardFacilities = [
    'Clean Drinking Water',
    'First Aid Station',
    'Separated Family Quarters',
    'Backup Generator',
    'Sanitation Units',
    'Community Kitchen',
    'Infirmary',
    'Infant Nutrition Station',
    'Solar Lighting',
    'Helipad Area',
  ];

  const handleFacilityToggle = (fac) => {
    if (formData.facilities.includes(fac)) {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter((f) => f !== fac),
      });
    } else {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, fac],
      });
    }
  };

  const handleAddCustomFacility = () => {
    if (!customFacility.trim()) return;
    if (!formData.facilities.includes(customFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, customFacility.trim()],
      });
    }
    setCustomFacility('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.address.trim()) {
      setErrorMsg('Please provide a shelter name and street address.');
      return;
    }

    const parsedTotal = parseInt(formData.capacityTotal, 10);
    const parsedCurrent = parseInt(formData.capacityCurrent, 10) || 0;

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrorMsg('Total capacity must be a positive number greater than zero.');
      return;
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setErrorMsg('Initial occupancy cannot be negative.');
      return;
    }

    if (parsedCurrent > parsedTotal) {
      setErrorMsg(`Initial occupancy (${parsedCurrent}) cannot exceed total capacity (${parsedTotal}).`);
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        name: formData.name.trim(),
        hazardType: formData.hazardType,
        hazardCategoryLabel:
          formData.hazardType === 'flood'
            ? 'High-Ground Facilities (Floods)'
            : 'Open Assembly Grounds (Earthquakes)',
        capacityTotal: parsedTotal,
        capacityCurrent: parsedCurrent,
        district: formData.district,
        address: formData.address.trim(),
        elevationMeters:
          formData.hazardType === 'flood' ? parseFloat(formData.elevationMeters) || 30 : undefined,
        clearanceRadiusMeters:
          formData.hazardType === 'earthquake'
            ? parseFloat(formData.clearanceRadiusMeters) || 80
            : undefined,
        coordinator: {
          name: formData.coordinatorName,
          phone: formData.coordinatorPhone,
          email: formData.coordinatorEmail,
          designation: 'Relief Coordinator',
        },
        facilities: formData.facilities,
        notes: formData.notes.trim() || undefined,
        isVerified: true,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create new verified shelter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 text-white mb-1">
              <ShieldCheck size={12} />
              DMC Registration Protocol
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Register Verified Disaster Shelter
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Classify safe haven by hazard vulnerability and evacuation profile
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2 font-medium">
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hazard Type Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Hazard Categorization *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Flood Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hazardType: 'flood' })}
                className={`p-3.5 rounded-lg border text-left transition-all relative ${
                  formData.hazardType === 'flood'
                    ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <Waves size={16} />
                  </div>
                  {formData.hazardType === 'flood' && (
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  )}
                </div>
                <div className="font-bold text-sm text-slate-900">
                  High-Ground Facility
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  For Floods & Inundations. Elevated structures, school halls, hill campuses.
                </div>
              </button>

              {/* Earthquake Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hazardType: 'earthquake' })}
                className={`p-3.5 rounded-lg border text-left transition-all relative ${
                  formData.hazardType === 'earthquake'
                    ? 'border-stone-600 bg-stone-100/70 ring-1 ring-stone-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-md bg-stone-200 text-stone-800 flex items-center justify-center font-bold">
                    <TreePine size={16} />
                  </div>
                  {formData.hazardType === 'earthquake' && (
                    <span className="w-2 h-2 rounded-full bg-stone-700" />
                  )}
                </div>
                <div className="font-bold text-sm text-slate-900">
                  Open Assembly Ground
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  For Earthquakes & Tremors. Open fields, stadiums, wide clearance zones.
                </div>
              </button>
            </div>
          </div>

          {/* Shelter Name & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shelter / Facility Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sammanthurai Central College"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
              >
                {[
                  'Ampara',
                  'Batticaloa',
                  'Colombo',
                  'Galle',
                  'Gampaha',
                  'Kalutara',
                  'Kandy',
                  'Matara',
                  'Trincomalee',
                  'Jaffna',
                  'Kurunegala',
                  'Ratnapura',
                ].map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Street Address & Landmark *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Main High Street, Sammanthurai (near Divisional Secretariat)"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
            />
          </div>

          {/* Capacities & Hazard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Capacity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacityTotal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacityTotal: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Occupancy
              </label>
              <input
                type="number"
                min="0"
                value={formData.capacityCurrent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacityCurrent: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-bold text-slate-900"
              />
            </div>

            {formData.hazardType === 'flood' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Elevation (Meters ASL)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.elevationMeters}
                  onChange={(e) =>
                    setFormData({ ...formData, elevationMeters: e.target.value })
                  }
                  placeholder="e.g. 40"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-bold text-slate-900"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Debris Clearance (Meters)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.clearanceRadiusMeters}
                  onChange={(e) =>
                    setFormData({ ...formData, clearanceRadiusMeters: e.target.value })
                  }
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-bold text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Coordinator Details */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">
              Assigned Coordinator Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={formData.coordinatorName}
                onChange={(e) =>
                  setFormData({ ...formData, coordinatorName: e.target.value })
                }
                placeholder="Coordinator Name"
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-800"
              />
              <input
                type="text"
                value={formData.coordinatorPhone}
                onChange={(e) =>
                  setFormData({ ...formData, coordinatorPhone: e.target.value })
                }
                placeholder="Coordinator Phone (+94...)"
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Facilities Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Available Facilities & Sanitation
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {standardFacilities.map((f) => {
                const isSelected = formData.facilities.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleFacilityToggle(f)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                placeholder="Add other facility (e.g. Wi-Fi Access, Wheelchair Ramps)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md border border-slate-300 text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Safety Notes & Disaster Response Protocol
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Direct road access via A4 highway. Elevated ground safely above recorded reservoir overflow mark."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={14} />
                  <span>Register Shelter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
