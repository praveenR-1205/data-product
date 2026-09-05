import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Clock, MinusCircle, Info } from 'lucide-react';
import { TestStatus } from '../../types/testRun';
import { ValidationRuleStatus } from '../../types/validation';
import { getTestStatusConfig, getValidationStatusConfig } from '../../utils/status';

export type ExtendedStatus = TestStatus | ValidationRuleStatus | 'Info';

interface StatusBadgeProps {
  status: ExtendedStatus;
  isValidation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isValidation = false,
  size = 'md',
  showIcon = true,
}) => {
  if (status === 'Info') {
    return (
      <span className="inline-flex items-center rounded-md border bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF] px-2.5 py-1 text-xs font-semibold gap-1.5 tracking-tight">
        {showIcon && <Info size={13} className="shrink-0 text-[#2E90FA]" />}
        <span>Info</span>
      </span>
    );
  }

  const config = isValidation
    ? getValidationStatusConfig(status as ValidationRuleStatus)
    : getTestStatusConfig(status as TestStatus);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 15,
  };

  const renderIcon = () => {
    switch (config.iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 size={iconSizes[size]} className="shrink-0 text-emerald-600" />;
      case 'AlertTriangle':
        return <AlertTriangle size={iconSizes[size]} className="shrink-0 text-amber-600" />;
      case 'XCircle':
        return <XCircle size={iconSizes[size]} className="shrink-0 text-red-600" />;
      case 'Loader2':
        return <Loader2 size={iconSizes[size]} className="shrink-0 text-[#FF6600] animate-spin" />;
      case 'Clock':
        return <Clock size={iconSizes[size]} className="shrink-0 text-slate-500" />;
      case 'MinusCircle':
      default:
        return <MinusCircle size={iconSizes[size]} className="shrink-0 text-slate-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses[size]} transition-colors tracking-tight`}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
