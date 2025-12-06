import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

export async function purchaseTokens(profileId: string, tokenAmount: number) {
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, tokenAmount }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

export async function createConnectAccount(profileId: string) {
  const response = await fetch('/api/stripe/create-connect-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Stripe Connect account');
  }

  return response.json();
}

export async function transferToBuilder(
  builderStripeId: string,
  amount: number,
  ideaId: string,
  milestoneId: string
) {
  const response = await fetch('/api/stripe/transfer-to-builder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ builderStripeId, amount, ideaId, milestoneId }),
  });

  if (!response.ok) {
    throw new Error('Failed to transfer funds to builder');
  }

  return response.json();
}
