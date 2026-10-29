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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <EmergencyHotlineBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-5 flex-grow pb-16">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Noticeboard</span>
        </Link>

        {/* Page Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-slate-200 text-slate-800 rounded-md">
              <Bell className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Post Emergency Notice or Disaster Advisory
            </h1>
          </div>
          <p className="text-slate-600 text-xs">
            Publish early warnings, evacuation advisories, weather notices, or report active disaster conditions across Sri Lanka.
          </p>
        </div>

        {/* Community Verification Safety Advisory */}
        {!isAdmin && (
          <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-900">Community Submission Protocol:</p>
              <p>
                Notices submitted by citizens or field volunteers are marked as <span className="font-semibold text-slate-900">Community Advisories</span>.
                Authorized DMC coordinators will verify source provenance before elevating them to official broadcasts. False submissions are logged.
              </p>
            </div>
          </div>
        )}

        {/* Server Error Callout */}
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Alert Headline / Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Red Alert: Rapid Reservoir Spillage & Evacuation Order for Gal Oya Basin"
              className={`w-full px-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Hazard Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Disaster Hazard Classification <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.hazardType}
                onChange={(e) => setFormData({ ...formData, hazardType: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              >
                {HAZARD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Severity Level <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              >
                {SEVERITY_LEVELS.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev} ({sev === 'Critical' ? 'Immediate Threat/Evacuation' : sev === 'High' ? 'Substantial Impact' : sev === 'Medium' ? 'Precautionary Watch' : 'Informational'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Affected Districts Multi-Select */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-800">
                Impacted Sri Lankan Administrative Districts <span className="text-rose-600">*</span>
              </label>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Ampara', 'Batticaloa', 'Trincomalee'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition"
                >
                  + Eastern
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition"
                >
                  + Northern
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProvinceDistricts(['Badulla', 'Kandy', 'Kegalle', 'Matale', 'Nuwara Eliya', 'Ratnapura'])}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition"
                >
                  + Central / Highlands
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, affectedDistricts: [] }))}
                  className="px-2 py-0.5 text-rose-700 hover:bg-rose-50 rounded text-[11px] font-medium transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-44 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {SRI_LANKA_DISTRICTS.map((district) => {
                const selected = formData.affectedDistricts.includes(district);
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleToggleDistrict(district)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-left transition border ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${selected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{district}</span>
                  </button>
                );
              })}
            </div>
            {errors.affectedDistricts && (
              <p className="text-xs text-rose-600">{errors.affectedDistricts}</p>
            )}
            <p className="text-[11px] text-slate-500">
              Selected: <span className="font-semibold text-slate-800">{formData.affectedDistricts.length}</span> district(s)
            </p>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Advisory Message &amp; Evacuation Instructions <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Detail the emergency situation, water levels, safe high-ground shelters, evacuation routes, and critical precautions..."
              className={`w-full px-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition leading-relaxed ${
                errors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.message && <p className="text-xs text-rose-600 mt-1">{errors.message}</p>}
          </div>

          {/* Source & Provenance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Source Entity / Agency <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sourceName}
                onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                placeholder="e.g. Disaster Management Centre (DMC) or Divisional Secretariat"
                className={`w-full px-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                  errors.sourceName ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.sourceName && <p className="text-xs text-rose-600 mt-1">{errors.sourceName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Agency Bulletin URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://www.dmc.gov.lk/bulletin"
                  className={`w-full pl-8 pr-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                    errors.sourceUrl ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              {errors.sourceUrl && <p className="text-xs text-rose-600 mt-1">{errors.sourceUrl}</p>}
            </div>
          </div>

          {/* Validity Expiry and Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Valid Until / Expiration (Optional)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`w-full pl-8 pr-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                    errors.expiresAt ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              {errors.expiresAt && <p className="text-xs text-rose-600 mt-1">{errors.expiresAt}</p>}
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alert will automatically archive once this time is reached.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Incident Hotline / Direct Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. 117 or +94 63 222 2341"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Administrator Controls */}
          {isAdmin && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="text-xs font-bold text-slate-800">
                Administrator Dispatch Controls
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="Published"
                    checked={formData.publicationStatus === 'Published'}
                    onChange={() => setFormData({ ...formData, publicationStatus: 'Published' })}
                    className="w-3.5 h-3.5 text-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Publish to Live Broadcast Feed</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="Draft"
                    checked={formData.publicationStatus === 'Draft'}
                    onChange={() => setFormData({ ...formData, publicationStatus: 'Draft' })}
                    className="w-3.5 h-3.5 text-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Save as Draft</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={formData.isOfficial}
                    onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                    className="w-3.5 h-3.5 text-slate-900 rounded"
                  />
                  <span className="text-xs font-medium text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Official Agency Verified Communication</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Link
              to="/alerts"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting Alert...' : formData.publicationStatus === 'Published' ? 'Broadcast Alert' : 'Submit Draft Notice'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
