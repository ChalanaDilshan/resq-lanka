import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ExternalLink,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getNoticeById,
  verifyNoticeSource,
  withdrawNotice,
  deleteNotice,
} from '../../services/noticeService';
import AlertSeverityBadge from '../../components/mod5-noticeboard/AlertSeverityBadge';
import VerificationBadge from '../../components/mod5-noticeboard/VerificationBadge';
import EmergencyHotlineBar from '../../components/mod5-noticeboard/EmergencyHotlineBar';
import NoticeVerificationModal from '../../components/mod5-noticeboard/NoticeVerificationModal';
import NoticeWithdrawModal from '../../components/mod5-noticeboard/NoticeWithdrawModal';
import { SEVERITY_CONFIG } from '../../utils/noticeConstants';
import timeAgo from '../../utils/timeAgo';

export default function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();

  const isAdmin =
    activeRole === 'administrator' ||
    activeRole === 'coordinator' ||
    user?.role === 'administrator' ||
    user?.role === 'coordinator';

  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchNotice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNoticeById(id);
      if (!data) {
        setError('Notice not found.');
      } else {
        setNotice(data);
      }
    } catch (err) {
      console.error('Error fetching notice details:', err);
      setError('Emergency notice not found or server is unreachable.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await getNoticeById(id);
        if (!ignore) {
          if (!data) {
            setError('Notice not found.');
          } else {
            setNotice(data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching notice details:', err);
          setError('Emergency notice not found or server is unreachable.');
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleVerifyConfirm = async (verificationData) => {
    await verifyNoticeSource(notice._id, verificationData);
    setActionSuccess('Source verification updated.');
    fetchNotice();
  };

  const handleWithdrawConfirm = async (reason) => {
    await withdrawNotice(notice._id, reason);
    setActionSuccess('Notice has been officially withdrawn.');
    fetchNotice();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this alert record?')) {
      return;
    }
    try {
      await deleteNotice(notice._id);
      navigate('/alerts');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <EmergencyHotlineBar />
        <div className="max-w-4xl mx-auto px-4 py-16 w-full animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded-lg" />
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <EmergencyHotlineBar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Alert Not Found</h2>
          <p className="text-sm text-slate-600">{error || 'The requested emergency notice does not exist.'}</p>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Noticeboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    message,
    hazardType,
    severity = 'Medium',
    affectedDistricts = [],
    sourceName,
    sourceUrl,
    isOfficial,
    verificationStatus = 'Unverified',
    verificationNotes,
    publicationStatus = 'Published',
    publishedAt,
    expiresAt,
    withdrawnReason,
    withdrawnAt,
    contactNumber,
  } = notice;

  const isPastExpiry = notice.isCurrent === false && Boolean(expiresAt);
  const isWithdrawn = publicationStatus === 'Withdrawn';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;

  // Hazard Safety Tips
  const getSafetyGuidelines = () => {
    switch (hazardType) {
      case 'Flood':
        return [
          'Move promptly to designated high-ground shelters or school assembly points.',
          'Never attempt to walk, swim, or drive through flowing water. Just 15cm of rapid water can knock you down.',
          'Keep emergency medicines, birth certificates, and dry rations sealed in waterproof polythene.',
          'Turn off main electricity breakers if flood water threatens home ground floors.',
        ];
      case 'Cyclone':
      case 'Heavy Rainfall':
        return [
          'Secure loose roof sheets, solar panels, and outdoor items with rope or sandbags.',
          'Clear drainage gutters around houses to prevent local inundation.',
          'Do not shelter under tall trees, electrical poles, or corroded billboards.',
          'Avoid sea voyages and coastal lagoon fishing until marine warning is revoked.',
        ];
      case 'Landslide':
        return [
          'Evacuate immediately if you notice ground fissures, tilting retaining walls, or sudden muddy springs.',
          'Stay alert during nighttime continuous rainfall exceeding 100mm.',
          'Report cutting failures to your local Grama Niladhari or NBRO desk.',
        ];
      case 'Earthquake':
        return [
          'Drop, Cover, and Hold On beneath heavy tables if inside.',
          'Evacuate to open ground away from overhead utility wires and unreinforced masonry.',
          'Expect minor aftershocks and do not re-enter damaged premises without structural clearance.',
        ];
      default:
        return [
          'Follow instructions broadcast by DMC district disaster secretariats.',
          'Keep your mobile phone charged and tuned to SLBC or local radio emergency alerts.',
          'Assist pregnant mothers, children, and elderly neighbors to safe gathering areas.',
        ];
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <EmergencyHotlineBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-grow">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Emergency Noticeboard</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Alert Link'}</span>
          </button>
        </div>

        {/* Success Banner */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Alert Card */}
        <div className={`bg-white rounded-3xl border ${config.borderClass} border-slate-200 shadow-sm overflow-hidden`}>
          {/* Status Banners */}
          {isWithdrawn && (
            <div className="bg-rose-600 text-white px-6 py-2.5 text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                WITHDRAWN NOTICE{withdrawnAt ? ` (${new Date(withdrawnAt).toLocaleDateString()})` : ''}: {withdrawnReason || 'Official advisory revoked.'}
              </span>
            </div>
          )}
          {!isWithdrawn && isPastExpiry && (
            <div className="bg-slate-700 text-slate-200 px-6 py-2.5 text-sm font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 shrink-0 text-slate-400" />
              <span>EXPIRED ALERT: This emergency advisory has passed its validity threshold.</span>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Badges Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <AlertSeverityBadge severity={severity} size="lg" />
                <VerificationBadge isOfficial={isOfficial} verificationStatus={verificationStatus} size="lg" />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span>Hazard Classification:</span>
                <span className="text-slate-900 font-extrabold">{hazardType}</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>

              {/* Published and Expiry Times */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Published {publishedAt ? new Date(publishedAt).toLocaleString() : 'Recently'} ({publishedAt && timeAgo(publishedAt)})
                </span>

                {expiresAt && (
                  <span className={`flex items-center gap-1.5 font-semibold ${isPastExpiry ? 'text-rose-600' : 'text-slate-600'}`}>
                    <span>Valid until:</span>
                    <span>{new Date(expiresAt).toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Impacted Districts */}
            {affectedDistricts.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Impacted Areas &amp; Administrative Districts:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {affectedDistricts.map((district) => (
                    <span
                      key={district}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs"
                    >
                      {district} District
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Message Body */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
                Emergency Situation Advisory
              </h2>
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {message}
              </div>
            </div>

            {/* Emergency Hotline Contact if available */}
            {contactNumber && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-800 font-semibold uppercase tracking-wider">
                      Designated Emergency Hotline for this Incident:
                    </div>
                    <div className="text-base font-black text-amber-950">
                      {contactNumber}
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${contactNumber}`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shrink-0"
                >
                  Call Now
                </a>
              </div>
            )}

            {/* Source Information & Official Verification Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Source Provenance &amp; Verification
                </div>
                <VerificationBadge isOfficial={isOfficial} verificationStatus={verificationStatus} size="sm" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-sm font-black text-slate-900">{sourceName}</div>
                  {verificationNotes && (
                    <div className="text-xs text-slate-500 mt-1 italic">
                      Verification Reference: {verificationNotes}
                    </div>
                  )}
                </div>

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition shrink-0 self-start sm:self-auto"
                  >
                    <span>Visit Agency Bulletin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Safety Guidelines */}
            <div className="p-5 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Recommended Safety Protocols for {hazardType}</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-blue-950">
                {getSafetyGuidelines().map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Action Toolbar */}
            {isAdmin && (
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Administrative Management Controls
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Verify Source
                  </button>

                  {!isWithdrawn && (
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Withdraw Alert
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Admin Modals */}
      {isVerifyModalOpen && (
        <NoticeVerificationModal
          notice={notice}
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onConfirm={handleVerifyConfirm}
        />
      )}

      {isWithdrawModalOpen && (
        <NoticeWithdrawModal
          notice={notice}
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdrawConfirm}
        />
      )}
    </div>
  );
}
