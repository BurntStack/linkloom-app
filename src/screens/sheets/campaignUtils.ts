import type { CampaignUsageRights } from '../../data';

export const USAGE_CHANNELS = [
  { label: 'Organic social', value: 'organic_social' },
  { label: 'Paid ads', value: 'paid_ads' },
  { label: 'Website', value: 'website' },
  { label: 'Email', value: 'email' },
];

export const USAGE_DURATIONS = ['30 days', '90 days', '1 year', 'Perpetual'];
export const DURATION_VALUES: Record<string, string> = {
  '30 days': '30_days',
  '90 days': '90_days',
  '1 year': '1_year',
  Perpetual: 'perpetual',
  '30_days': '30 days',
  '90_days': '90 days',
  '1_year': '1 year',
  perpetual: 'Perpetual',
};

export function formatCampaignUsageRights(value: CampaignUsageRights | string | undefined) {
  if (!value) return 'Not specified';
  if (typeof value === 'string') return value;
  const channels = value.channels.map((channel) => channel.replace(/_/g, ' ')).join(', ');
  return [
    `${DURATION_VALUES[value.duration] || value.duration} usage`,
    channels ? `Channels: ${channels}` : '',
    value.exclusivity ? `Exclusive${value.exclusivityCategory ? ` in ${value.exclusivityCategory}` : ''}` : 'Non-exclusive',
    value.territory ? `Territory: ${value.territory}` : '',
  ].filter(Boolean).join(' · ');
}

export function parseCampaignDeadline(value: string) {
  const input = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (dateOnly) {
    const [, yearText, monthText, dayText] = dateOnly;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
    if (deadline.getFullYear() !== year || deadline.getMonth() !== month - 1 || deadline.getDate() !== day) return null;
    return deadline;
  }
  const deadline = new Date(input);
  if (Number.isNaN(deadline.getTime())) return null;
  if (!/[T ]\d{1,2}:\d{2}/.test(input)) deadline.setHours(23, 59, 59, 999);
  return deadline;
}
