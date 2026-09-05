import { TestStatus } from '../types/testRun';
import { ValidationRuleStatus } from '../types/validation';

export interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  iconName: 'CheckCircle2' | 'AlertTriangle' | 'XCircle' | 'Loader2' | 'Clock' | 'MinusCircle';
}

export function getTestStatusConfig(status: TestStatus): StatusConfig {
  switch (status) {
    case 'Passed':
      return {
        label: 'Passed',
        badgeBg: 'bg-[#ECFDF3]',
        badgeText: 'text-[#027A48]',
        badgeBorder: 'border-[#ABEFC6]',
        dotColor: 'bg-[#12B76A]',
        iconName: 'CheckCircle2',
      };
    case 'Warning':
      return {
        label: 'Warning',
        badgeBg: 'bg-[#FFFAEB]',
        badgeText: 'text-[#B54708]',
        badgeBorder: 'border-[#FEDF89]',
        dotColor: 'bg-[#F79009]',
        iconName: 'AlertTriangle',
      };
    case 'Failed':
      return {
        label: 'Failed',
        badgeBg: 'bg-[#FEF3F2]',
        badgeText: 'text-[#B42318]',
        badgeBorder: 'border-[#FECDCA]',
        dotColor: 'bg-[#F04438]',
        iconName: 'XCircle',
      };
    case 'Running':
      return {
        label: 'Running',
        badgeBg: 'bg-[#FFF4ED]',
        badgeText: 'text-[#C4320A]',
        badgeBorder: 'border-[#FFD2B8]',
        dotColor: 'bg-[#FF6600]',
        iconName: 'Loader2',
      };
    case 'Pending':
      return {
        label: 'Pending',
        badgeBg: 'bg-[#F2F4F7]',
        badgeText: 'text-[#344054]',
        badgeBorder: 'border-[#D0D5DD]',
        dotColor: 'bg-[#98A2B3]',
        iconName: 'Clock',
      };
    case 'Skipped':
    default:
      return {
        label: 'Skipped',
        badgeBg: 'bg-[#F8F9FA]',
        badgeText: 'text-[#667085]',
        badgeBorder: 'border-[#E4E7EC]',
        dotColor: 'bg-[#98A2B3]',
        iconName: 'MinusCircle',
      };
  }
}

export function getValidationStatusConfig(status: ValidationRuleStatus): StatusConfig {
  switch (status) {
    case 'PASS':
      return {
        label: 'PASS',
        badgeBg: 'bg-[#ECFDF3]',
        badgeText: 'text-[#027A48]',
        badgeBorder: 'border-[#ABEFC6]',
        dotColor: 'bg-[#12B76A]',
        iconName: 'CheckCircle2',
      };
    case 'WARNING':
      return {
        label: 'WARNING',
        badgeBg: 'bg-[#FFFAEB]',
        badgeText: 'text-[#B54708]',
        badgeBorder: 'border-[#FEDF89]',
        dotColor: 'bg-[#F79009]',
        iconName: 'AlertTriangle',
      };
    case 'FAIL':
      return {
        label: 'FAIL',
        badgeBg: 'bg-[#FEF3F2]',
        badgeText: 'text-[#B42318]',
        badgeBorder: 'border-[#FECDCA]',
        dotColor: 'bg-[#F04438]',
        iconName: 'XCircle',
      };
    case 'SKIPPED':
    default:
      return {
        label: 'SKIPPED',
        badgeBg: 'bg-[#F2F4F7]',
        badgeText: 'text-[#667085]',
        badgeBorder: 'border-[#D0D5DD]',
        dotColor: 'bg-[#98A2B3]',
        iconName: 'MinusCircle',
      };
  }
}

export function getEnvironmentBadgeStyle(env: string): { bg: string; text: string; border: string } {
  switch (env) {
    case 'PROD':
      return { bg: 'bg-[#FEF3F2]', text: 'text-[#B42318] font-bold', border: 'border-[#FECDCA]' };
    case 'PREPROD':
      return { bg: 'bg-[#FFFAEB]', text: 'text-[#B54708] font-semibold', border: 'border-[#FEDF89]' };
    case 'DEV':
    default:
      return { bg: 'bg-[#EFF8FF]', text: 'text-[#175CD3] font-medium', border: 'border-[#B2DDFF]' };
  }
}
