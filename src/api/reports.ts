import { request, requestDownload } from './client';

export async function getReportOverview() {
  return request<any>('/v1/reports/overview/');
}

export async function exportOrdersReport() {
  return requestDownload('/v1/reports/export/orders/');
}

export async function exportCampaignsReport() {
  return requestDownload('/v1/reports/export/campaigns/');
}

export async function exportTransactionsReport() {
  return requestDownload('/v1/reports/export/transactions/');
}
