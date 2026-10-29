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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <EmergencyHotlineBar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full animate-pulse space-y-5">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-44 bg-slate-200 rounded-xl" />
          <div className="h-60 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <EmergencyHotlineBar />
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Alert Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested emergency notice does not exist.'}</p>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-md hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
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
          'Move promptly to designated high-ground shelters or safe assembly points.',
          'Never attempt to walk, swim, or drive through fast-moving water. Just 15cm of moving water can cause falls.',
          'Keep emergency medicines, national identity cards, and essential rations sealed in waterproof bags.',
          'Turn off main electricity distribution boards if water threatens household ground floors.',
        ];
      case 'Cyclone':
      case 'Heavy Rainfall':
        return [
          'Secure loose roof sheets, solar panels, and outdoor items with ropes or sandbags.',
          'Clear storm gutters around premises to reduce localized flooding risks.',
          'Avoid sheltering under unpruned trees, overhead electrical lines, or corroded billboards.',
          'Suspend marine fishing and coastal operations until official warning cancellation is issued.',
        ];
      case 'Landslide':
        return [
          'Evacuate immediately upon observing ground fissures, tilting boundary walls, or muddy runoff.',
          'Maintain vigilance during continuous rainfall surpassing 100mm within 24 hours.',
          'Report early slope instability signs to your local Grama Niladhari or NBRO field station.',
        ];
      case 'Earthquake':
        return [
          'Drop, Cover, and Hold On beneath sturdy tables if indoors during tremors.',
          'Evacuate to open grounds clear of masonry parapets, glass facades, and overhead grids.',
          'Prepare for secondary aftershocks and avoid re-entering damaged structures without clearance.',
        ];
      default:
        return [
          'Follow instructions broadcast by DMC district disaster coordination secretariats.',
          'Keep communication phones charged and monitor verified civil protection bulletins.',
          'Support children, disabled family members, and elderly neighbors to certified safe havens.',
        ];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <EmergencyHotlineBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4 flex-grow pb-16">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Emergency Noticeboard</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-md text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? 'Link Copied' : 'Share Alert Link'}</span>
          </button>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-3 bg-slate-900 text-white border border-slate-800 rounded-lg text-xs font-medium flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Alert File */}
        <div className={`bg-white rounded-xl border ${config.borderClass} border-slate-200 shadow-xs overflow-hidden`}>
          {/* Status Banners */}
          {isWithdrawn && (
            <div className="bg-rose-700 text-white px-5 py-2 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Withdrawn Notice{withdrawnAt ? ` (${new Date(withdrawnAt).toLocaleDateString()})` : ''}: {withdrawnReason || 'Official advisory revoked.'}
              </span>
            </div>
          )}
          {!isWithdrawn && isPastExpiry && (
            <div className="bg-slate-700 text-slate-200 px-5 py-2 text-xs font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Expired Alert: This emergency advisory has passed its operational validity window.</span>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            {/* Badges Header */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <AlertSeverityBadge severity={severity} size="md" />
                <VerificationBadge isOfficial={isOfficial} verificationStatus={verificationStatus} size="md" />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                <span className="font-normal">Hazard:</span>
                <span className="text-slate-900 font-semibold">{hazardType}</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h1>

              {/* Published and Expiry Times */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Published {publishedAt ? new Date(publishedAt).toLocaleString() : 'Recently'} ({publishedAt && timeAgo(publishedAt)})
                </span>

                {expiresAt && (
                  <span className={`flex items-center gap-1 font-medium ${isPastExpiry ? 'text-rose-700' : 'text-slate-700'}`}>
                    <span>Valid until:</span>
                    <span>{new Date(expiresAt).toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Impacted Districts */}
            {affectedDistricts.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Impacted Areas &amp; Administrative Districts:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {affectedDistricts.map((district) => (
                    <span
                      key={district}
                      className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded"
                    >
                      {district} District
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Message Body */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-slate-800">
                Official Incident Advisory Details
              </h2>
              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200">
                {message}
              </div>
            </div>

            {/* Emergency Hotline Contact if available */}
            {contactNumber && (
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 font-medium">
                      Designated Emergency Desk for this Incident:
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {contactNumber}
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${contactNumber}`}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs transition shrink-0"
                >
                  Call Desk
                </a>
              </div>
            )}

            {/* Source Information & Official Verification Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  Source Provenance &amp; Verification
                </div>
                <VerificationBadge isOfficial={isOfficial} verificationStatus={verificationStatus} size="sm" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                <div>
                  <div className="text-sm font-bold text-slate-900">{sourceName}</div>
                  {verificationNotes && (
                    <div className="text-xs text-slate-500 mt-0.5 italic">
                      Verification Reference: {verificationNotes}
                    </div>
                  )}
                </div>

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-md text-xs font-semibold border border-slate-200 transition shrink-0 self-start sm:self-auto"
                  >
                    <span>Official Agency Bulletin</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
              </div>
            </div>

            {/* Safety Guidelines */}
            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-lg space-y-2">
              <h3 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span>Recommended Civil Safety Actions for {hazardType}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {getSafetyGuidelines().map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Action Toolbar */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs font-semibold text-slate-600">
                  Administrative Incident Controls
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer"
                  >
                    Verify Source
                  </button>

                  {!isWithdrawn && (
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                      Withdraw Alert
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
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
