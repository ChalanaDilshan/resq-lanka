import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Info,
  MapPin,
  Calendar,
  Phone,
  Link as LinkIcon,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createNotice } from '../../services/noticeService';
import {
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  SRI_LANKA_DISTRICTS,
} from '../../utils/noticeConstants';
import EmergencyHotlineBar from '../../components/mod5-noticeboard/EmergencyHotlineBar';

export default function PostAlertPage() {
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();

  const isAdmin =
    activeRole === 'administrator' ||
    activeRole === 'coordinator' ||
    user?.role === 'administrator' ||
    user?.role === 'coordinator';

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    hazardType: 'Flood',
    severity: 'Medium',
    affectedDistricts: ['Ampara'],
    sourceName: isAdmin ? 'Disaster Management Centre (DMC)' : (user?.name ? `${user.name} (Community Report)` : 'Community Volunteer Watch'),
    sourceUrl: '',
    contactNumber: '117',
    expiresAt: '',
    publicationStatus: isAdmin ? 'Published' : 'Draft',
    isOfficial: isAdmin,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Quick district selection helpers
  const handleToggleDistrict = (district) => {
    setFormData((prev) => {
      const exists = prev.affectedDistricts.includes(district);
      const updated = exists
        ? prev.affectedDistricts.filter((d) => d !== district)
        : [...prev.affectedDistricts, district];
      return { ...prev, affectedDistricts: updated };
    });
  };

  const handleSelectProvinceDistricts = (districtsList) => {
    setFormData((prev) => {
      const combined = Array.from(new Set([...prev.affectedDistricts, ...districtsList]));
      return { ...prev, affectedDistricts: combined };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    } else if (formData.title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }

    if (!formData.sourceName.trim() || formData.sourceName.trim().length < 2) {
      errs.sourceName = 'Source agency or reporter name is required.';
    }

    if (formData.affectedDistricts.length === 0) {
      errs.affectedDistricts = 'Select at least one affected district.';
    }

    if (formData.expiresAt) {
      const expDate = new Date(formData.expiresAt);
      if (isNaN(expDate.getTime()) || expDate.getTime() <= Date.now()) {
        errs.expiresAt = 'Expiry date must be in the future.';
      }
    }

    if (formData.sourceUrl && !/^https?:\/\//i.test(formData.sourceUrl)) {
      errs.sourceUrl = 'Source URL must begin with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        hazardType: formData.hazardType,
        severity: formData.severity,
        affectedDistricts: formData.affectedDistricts,
        sourceName: formData.sourceName.trim(),
        sourceUrl: formData.sourceUrl.trim(),
        contactNumber: formData.contactNumber.trim(),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        publicationStatus: formData.publicationStatus,
        isOfficial: isAdmin ? formData.isOfficial : false,
      };

      const result = await createNotice(payload);
      if (result?.data?._id) {
        navigate(`/alerts/${result.data._id}`);
      } else {
        navigate('/alerts');
      }
    } catch (err) {
      console.error('Failed to post alert:', err);
      setServerError(
        err.response?.data?.message || err.message || 'Failed to submit emergency alert. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <EmergencyHotlineBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-grow">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Noticeboard</span>
        </Link>

        {/* Page Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Post Emergency Notice or Disaster Alert
            </h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            Publish early warnings, evacuation orders, weather advisories, or report local disaster conditions in Sri Lanka.
          </p>
        </div>

        {/* Community Verification Safety Advisory */}
        {!isAdmin && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold">Community Submission Policy:</p>
              <p>
                Notices posted by citizens or volunteers are recorded as <span className="font-bold">Unverified Drafts</span>.
                They will undergo rapid review by authorized ResQ coordinators before being elevated or broadcast as verified disaster alerts.
                Do not submit false reports.
              </p>
            </div>
          </div>
        )}

        {/* Server Error Callout */}
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alert Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Red Alert: Rapid Reservoir Spillage & Evacuation Order for Gal Oya Basin"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Hazard Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Disaster Hazard Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hazardType}
                onChange={(e) => setFormData({ ...formData, hazardType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                {HAZARD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                {SEVERITY_LEVELS.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev} ({sev === 'Critical' ? 'Immediate Evacuation/Threat' : sev === 'High' ? 'Substantial Impact' : sev === 'Medium' ? 'Precautionary Watch' : 'Informational'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Affected Districts Multi-Select */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Impacted Sri Lankan Districts <span className="text-red-500">*</span>
              </label>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Ampara', 'Batticaloa', 'Trincomalee'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition"
                >
                  + Eastern
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition"
                >
                  + Northern
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Badulla', 'Kandy', 'Kegalle', 'Matale', 'Nuwara Eliya', 'Ratnapura'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition"
                >
                  + Central / Highlands
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, affectedDistricts: [] }))}
                  className="px-2 py-0.5 text-rose-600 hover:bg-rose-50 rounded-md text-[11px] font-semibold transition"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SRI_LANKA_DISTRICTS.map((district) => {
                const selected = formData.affectedDistricts.includes(district);
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleToggleDistrict(district)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition border ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${selected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{district}</span>
                  </button>
                );
              })}
            </div>
            {errors.affectedDistricts && (
              <p className="text-xs text-red-600">{errors.affectedDistricts}</p>
            )}
            <p className="text-[11px] text-slate-500">
              Selected: <span className="font-bold text-slate-800">{formData.affectedDistricts.length}</span> district(s)
            </p>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Advisory Message &amp; Evacuation Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Detail the emergency situation, water levels, safe high-ground shelters, evacuation routes, and critical precautions..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition leading-relaxed ${
                errors.message ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            />
            {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
          </div>

          {/* Source & Provenance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Source Entity / Agency <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sourceName}
                onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                placeholder="e.g. Disaster Management Centre (DMC) or Divisional Secretariat"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                  errors.sourceName ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {errors.sourceName && <p className="text-xs text-red-600 mt-1">{errors.sourceName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Agency Bulletin URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://www.dmc.gov.lk/bulletin"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                    errors.sourceUrl ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {errors.sourceUrl && <p className="text-xs text-red-600 mt-1">{errors.sourceUrl}</p>}
            </div>
          </div>

          {/* Validity Expiry and Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Valid Until / Expiration (Optional)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                    errors.expiresAt ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {errors.expiresAt && <p className="text-xs text-red-600 mt-1">{errors.expiresAt}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                Alert will automatically archive once this time is reached.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Incident Hotline / Direct Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. 117 or +94 63 222 2341"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Administrator Controls */}
          {isAdmin && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Administrator Publishing Settings
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="Published"
                    checked={formData.publicationStatus === 'Published'}
                    onChange={() => setFormData({ ...formData, publicationStatus: 'Published' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-800">Publish Immediately to Live Feed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="Draft"
                    checked={formData.publicationStatus === 'Draft'}
                    onChange={() => setFormData({ ...formData, publicationStatus: 'Draft' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-800">Save as Draft</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={formData.isOfficial}
                    onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official Agency Verified Communication</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/alerts"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Alert...' : formData.publicationStatus === 'Published' ? 'Broadcast Alert' : 'Submit Draft Notice'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
