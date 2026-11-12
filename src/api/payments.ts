import { request } from './client';

export async function createCheckoutSession(orderId: string) {
  return request<any>('/v1/checkout/', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return request<any>('/v1/payments/verify/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
