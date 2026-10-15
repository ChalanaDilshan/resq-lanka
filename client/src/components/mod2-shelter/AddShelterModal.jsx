import { useState } from 'react';
import {
  X,
  PlusCircle,
  Building,
  MapPin,
  Waves,
  TreePine,
  ShieldCheck,
  CheckCircle2,
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

    if (formData.capacityTotal <= 0) {
      setErrorMsg('Total capacity must be greater than zero.');
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
        capacityTotal: parseInt(formData.capacityTotal, 10),
        capacityCurrent: parseInt(formData.capacityCurrent, 10) || 0,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 mb-1">
              <ShieldCheck size={13} />
              DMC Registration Protocol
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Register Verified Disaster Shelter
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorize safe facility by hazard vulnerability profile
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hazard Type Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Hazard Categorization *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Flood Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hazardType: 'flood' })}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  formData.hazardType === 'flood'
                    ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    <Waves size={18} />
                  </div>
                  {formData.hazardType === 'flood' && (
                    <CheckCircle2 size={18} className="text-cyan-600 fill-cyan-100" />
                  )}
                </div>
                <div className="font-extrabold text-sm text-cyan-950">
                  High-Ground Facility
                </div>
                <div className="text-[11px] text-cyan-800 mt-1 leading-relaxed">
                  For Floods & Inundations. Elevated structures, school halls, hill campuses.
                </div>
              </button>

              {/* Earthquake Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hazardType: 'earthquake' })}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  formData.hazardType === 'earthquake'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <TreePine size={18} />
                  </div>
                  {formData.hazardType === 'earthquake' && (
                    <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <div className="font-extrabold text-sm text-emerald-950">
                  Open Assembly Ground
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  For Earthquakes & Tremors. Open fields, stadiums, wide clearance areas.
                </div>
              </button>
            </div>
          </div>

          {/* Shelter Name & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
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
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            {formData.hazardType === 'flood' ? (
              <div>
                <label className="block text-xs font-bold text-cyan-800 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-xs bg-cyan-50/50 border border-cyan-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-500 font-bold text-cyan-900"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-900"
                />
              </div>
            )}
          </div>

          {/* Coordinator Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Assigned Coordinator Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.coordinatorName}
                onChange={(e) =>
                  setFormData({ ...formData, coordinatorName: e.target.value })
                }
                placeholder="Coordinator Name"
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
              />
              <input
                type="text"
                value={formData.coordinatorPhone}
                onChange={(e) =>
                  setFormData({ ...formData, coordinatorPhone: e.target.value })
                }
                placeholder="Coordinator Phone (+94...)"
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Facilities Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Available Facilities & Sanitation
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {standardFacilities.map((f) => {
                const isSelected = formData.facilities.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleFacilityToggle(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
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
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Modal Actions */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={15} />
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
