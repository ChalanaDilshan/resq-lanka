import { ShieldCheck, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

export default function VerificationBadge({ isOfficial = false, verificationStatus = 'Unverified', size = 'md' }) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold rounded-lg',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold rounded-xl',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isOfficial && verificationStatus === 'Verified') {
    return (
      <span
        className={`inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm ${sizeClasses[size] || sizeClasses.md}`}
        title="Verified Official Agency Alert (e.g. DMC, Meteorology Dept)"
      >
        <ShieldCheck className={`${iconSizes[size] || iconSizes.md} text-emerald-600 stroke-[2.5]`} />
        <span>Official Verified</span>
      </span>
    );
  }

  if (verificationStatus === 'Verified') {
    return (
      <span
        className={`inline-flex items-center bg-blue-50 text-blue-800 border border-blue-300 shadow-sm ${sizeClasses[size] || sizeClasses.md}`}
        title="Community submission verified by ResQ coordinators"
      >
        <CheckCircle2 className={`${iconSizes[size] || iconSizes.md} text-blue-600 stroke-[2.5]`} />
        <span>Field Verified</span>
      </span>
    );
  }

  if (verificationStatus === 'Rejected') {
    return (
      <span
        className={`inline-flex items-center bg-rose-50 text-rose-800 border border-rose-300 shadow-sm ${sizeClasses[size] || sizeClasses.md}`}
        title="Source investigated and rejected or discredited"
      >
        <XCircle className={`${iconSizes[size] || iconSizes.md} text-rose-600 stroke-[2.5]`} />
        <span>Source Discredited</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center bg-amber-50 text-amber-800 border border-amber-300 shadow-sm ${sizeClasses[size] || sizeClasses.md}`}
      title="Community submission pending administrative verification"
    >
      <HelpCircle className={`${iconSizes[size] || iconSizes.md} text-amber-600 stroke-[2.5]`} />
      <span>Community (Unverified)</span>
    </span>
  );
}
