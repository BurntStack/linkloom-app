import { request, rupeesToPaise } from './client';

export async function getCreatorWallet() {
  return request<any>('/v1/creators/me/wallet/');
}

export async function requestCreatorWithdrawal(input: {
  amount: number;
  payoutMethod: 'upi' | 'bank_transfer';
  destination: string;
}) {
  return request<any>('/v1/creators/me/withdrawals/', {
    method: 'POST',
    body: JSON.stringify({ ...input, amount: rupeesToPaise(input.amount) }),
  });
}
