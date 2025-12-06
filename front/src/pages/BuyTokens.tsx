import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useUser } from '../contexts/UserContext';
import { useMutation } from '@tanstack/react-query';

export default function BuyTokens() {
  const { profileId, tokenBalance } = useUser();
  const [tokenAmount, setTokenAmount] = useState('100');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentIntent = async () => {
    const response = await fetch('http://localhost:3000/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        tokenAmount: parseInt(tokenAmount),
      }),
    });
    const data = await response.json();
    return data.clientSecret;
  };

  const mutation = useMutation({
    mutationFn: createPaymentIntent,
    onSuccess: (secret) => {
      setClientSecret(secret);
    },
  });

  const handleInitiatePayment = () => {
    mutation.mutate();
  };

  if (!profileId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-8">Please sign in to purchase tokens.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Buy Tokens</h1>

      <div className="card mb-8">
        <p className="text-gray-600 mb-4">Current Balance: <span className="font-bold text-2xl text-primary-600">{tokenBalance}</span> tokens</p>
      </div>

      {!clientSecret ? (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Select Token Amount</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Number of Tokens</label>
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="input"
                min="10"
                step="10"
              />
              <p className="text-sm text-gray-500 mt-2">
                Price: ${(parseInt(tokenAmount) * 0.1).toFixed(2)} USD
              </p>
              <p className="text-xs text-gray-400 mt-1">
                1 token = $0.10 USD
              </p>
            </div>
            <button
              onClick={handleInitiatePayment}
              disabled={mutation.isPending}
              className="btn-primary w-full"
            >
              {mutation.isPending ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm tokenAmount={parseInt(tokenAmount)} />
          </Elements>
        </div>
      )}
    </div>
  );
}

function CheckoutForm({ tokenAmount }: { tokenAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { refreshProfile } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/profile`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An error occurred');
      setIsProcessing(false);
    } else {
      setMessage(`Success! You purchased ${tokenAmount} tokens.`);
      refreshProfile();
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="btn-primary w-full mt-6"
      >
        {isProcessing ? 'Processing...' : `Pay $${(tokenAmount * 0.1).toFixed(2)}`}
      </button>
      {message && (
        <div className={`mt-4 p-4 rounded ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </form>
  );
}
