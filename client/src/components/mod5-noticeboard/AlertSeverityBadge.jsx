import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { SEVERITY_CONFIG } from '../../utils/noticeConstants';

export default function AlertSeverityBadge({ severity = 'Medium', size = 'md', showIcon = true }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;

  const getIcon = () => {
    switch (severity) {
      case 'Critical':
        return <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      case 'High':
        return <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      case 'Medium':
        return <AlertCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      case 'Low':
      default:
        return <Info className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold rounded',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold rounded-md',
    lg: 'text-sm px-3 py-1 gap-2 font-bold rounded-md',
  };

  return (
    <span
      className={`inline-flex items-center border shadow-xs ${config.badgeClass} ${sizeClasses[size] || sizeClasses.md}`}
      role="status"
      aria-label={`Severity level: ${severity}`}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  );
}
