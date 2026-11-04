import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ExternalLink,
  Phone,
  AlertTriangle,
  ChevronRight,
  Flame,
  CloudRain,
  Wind,
  Mountain,
  Waves,
  Activity,
} from 'lucide-react';
import AlertSeverityBadge from './AlertSeverityBadge';
import VerificationBadge from './VerificationBadge';
import { SEVERITY_CONFIG } from '../../utils/noticeConstants';
import timeAgo from '../../utils/timeAgo';

export default function NoticeCard({
  notice,
  onVerify,
  onWithdraw,
  isAdmin = false,
}) {
  const {
    _id,
    title,
    message,
    hazardType,
    severity = 'Medium',
    affectedDistricts = [],
    sourceName,
    sourceUrl,
    isOfficial,
    verificationStatus = 'Unverified',
    publicationStatus = 'Published',
    publishedAt,
    expiresAt,
    withdrawnReason,
    contactNumber,
  } = notice;

  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;

  // Determine current/expired status
  const isPastExpiry = notice.isCurrent === false && Boolean(expiresAt);
  const isWithdrawn = publicationStatus === 'Withdrawn';
  const isDraft = publicationStatus === 'Draft';
  const isInactive = isPastExpiry || isWithdrawn || isDraft;

  const getHazardIcon = (type) => {
    switch (type) {
      case 'Flood':
        return <Waves className="w-3.5 h-3.5 text-sky-600" />;
      case 'Cyclone':
        return <Wind className="w-3.5 h-3.5 text-sky-700" />;
      case 'Landslide':
        return <Mountain className="w-3.5 h-3.5 text-stone-700" />;
      case 'Heavy Rainfall':
        return <CloudRain className="w-3.5 h-3.5 text-blue-600" />;
      case 'Tsunami':
        return <Waves className="w-3.5 h-3.5 text-teal-700" />;
      case 'Earthquake':
        return <Activity className="w-3.5 h-3.5 text-stone-700" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  return (
    <article
      className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        isInactive ? 'opacity-85 border-slate-200 bg-slate-50/50' : `${config.borderClass} border-slate-200 hover:border-slate-300`
      }`}
    >
      {/* Withdrawn / Expired / Draft Status Banner */}
      {isWithdrawn && (
        <div className="bg-rose-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Officially Withdrawn: {withdrawnReason || 'Warning revoked by disaster authority.'}</span>
        </div>
      )}
      {!isWithdrawn && isPastExpiry && (
        <div className="bg-slate-700 text-slate-200 px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Expired Alert: This emergency advisory has passed its effective validity period.</span>
        </div>
      )}
      {isDraft && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Draft Submission: Awaiting administrative review and publication.</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3.5">
        {/* Top Badges & Hazard Classification */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <AlertSeverityBadge severity={severity} size="sm" />
              <VerificationBadge isOfficial={isOfficial} verificationStatus={verificationStatus} size="sm" />
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
              {getHazardIcon(hazardType)}
              <span>{hazardType}</span>
            </div>
          </div>

          {/* Alert Title */}
          <Link
            to={`/alerts/${_id}`}
            className="block text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug"
          >
            {title}
          </Link>

          {/* Affected Districts */}
          {affectedDistricts.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Impacted Districts:
              </span>
              {affectedDistricts.map((district) => (
                <span
                  key={district}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {district}
                </span>
              ))}
            </div>
          )}

          {/* Description Excerpt */}
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
            {message}
          </p>
        </div>

        {/* Bottom Metadata & Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-normal">Source:</span>
              <span className="font-semibold text-slate-800">{sourceName}</span>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 ml-1"
                  title="Visit official bulletin"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Published {publishedAt ? timeAgo(publishedAt) : 'Recently'}
              </span>

              {expiresAt && (
                <span className={isPastExpiry ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                  {isPastExpiry ? 'Expired' : `Valid until ${new Date(expiresAt).toLocaleDateString()}`}
                </span>
              )}

              {contactNumber && (
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {contactNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {/* Admin Actions */}
            {isAdmin && !isWithdrawn && onWithdraw && (
              <button
                type="button"
                onClick={() => onWithdraw(notice)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition cursor-pointer"
              >
                Withdraw
              </button>
            )}

            {isAdmin && onVerify && (
              <button
                type="button"
                onClick={() => onVerify(notice)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 border border-slate-300 rounded-md transition cursor-pointer"
              >
                Verify Source
              </button>
            )}

            <Link
              to={`/alerts/${_id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
