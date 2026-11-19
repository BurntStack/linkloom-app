import type { CampaignUsageRights } from '../../data';

export const USAGE_CHANNELS = [
  { label: 'Organic social', value: 'organic_social' },
  { label: 'Paid ads', value: 'paid_ads' },
  { label: 'Website', value: 'website' },
];

export const USAGE_DURATIONS = ['3 months', '6 months', '12 months', 'Perpetual'];
export const DURATION_VALUES: Record<string, string> = {
  '3 months': '3m',
  '6 months': '6m',
  '12 months': '12m',
  Perpetual: 'perpetual',
  '3m': '3 months',
  '6m': '6 months',
  '12m': '12 months',
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
