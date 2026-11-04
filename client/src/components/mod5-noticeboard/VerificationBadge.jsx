import { ShieldCheck, HelpCircle, XCircle } from 'lucide-react';

export default function VerificationBadge({
  isOfficial = false,
  verificationStatus = 'Unverified',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold rounded',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-md',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold rounded-md',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isOfficial && verificationStatus === 'Verified') {
    return (
      <span
        className={`inline-flex items-center bg-green-50 text-green-900 border border-green-300 shadow-xs ${
          sizeClasses[size] || sizeClasses.md
        }`}
        title="Verified Official Agency Alert (e.g. DMC, Meteorology Dept, NBRO)"
      >
        <ShieldCheck className={`${iconSizes[size] || iconSizes.md} text-green-700 shrink-0`} />
        <span>Official Bulletin</span>
      </span>
    );
  }

  if (verificationStatus === 'Verified') {
    return (
      <span
        className={`inline-flex items-center bg-sky-50 text-sky-900 border border-sky-300 shadow-xs ${
          sizeClasses[size] || sizeClasses.md
        }`}
        title="Community submission verified by ResQ coordinators"
      >
        <ShieldCheck className={`${iconSizes[size] || iconSizes.md} text-sky-700 shrink-0`} />
        <span>Field Verified</span>
      </span>
    );
  }

  if (verificationStatus === 'Rejected') {
    return (
      <span
        className={`inline-flex items-center bg-rose-50 text-rose-900 border border-rose-300 shadow-xs ${
          sizeClasses[size] || sizeClasses.md
        }`}
        title="Source investigated and rejected or discredited"
      >
        <XCircle className={`${iconSizes[size] || iconSizes.md} text-rose-700 shrink-0`} />
        <span>Source Discredited</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center bg-slate-100 text-slate-800 border border-slate-300 shadow-xs ${
        sizeClasses[size] || sizeClasses.md
      }`}
      title="Community submission pending administrative verification"
    >
      <HelpCircle className={`${iconSizes[size] || iconSizes.md} text-slate-600 shrink-0`} />
      <span>Community Advisory</span>
    </span>
  );
}
