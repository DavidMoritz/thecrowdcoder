import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const PLATFORM_FEE_PERCENTAGE = 0.05; // 5% platform fee

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { profileId, tokenAmount } = req.body;

    if (!profileId || !tokenAmount || tokenAmount < 10) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const amountInCents = tokenAmount * 10; // 1 token = $0.10, convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        profileId,
        tokenAmount: tokenAmount.toString(),
        type: 'token_purchase',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/create-connect-account', async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        profileId,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
      type: 'account_onboarding',
    });

    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({ error: 'Failed to create Connect account' });
  }
});

router.post('/transfer-to-builder', async (req, res) => {
  try {
    const { builderStripeId, amount, ideaId, milestoneId } = req.body;

    if (!builderStripeId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const platformFee = Math.floor(amount * PLATFORM_FEE_PERCENTAGE);
    const builderAmount = amount - platformFee;

    const transfer = await stripe.transfers.create({
      amount: builderAmount * 10, // Convert tokens to cents ($0.10 per token)
      currency: 'usd',
      destination: builderStripeId,
      metadata: {
        ideaId,
        milestoneId,
        originalAmount: amount.toString(),
        platformFee: platformFee.toString(),
      },
    });

    res.json({
      transferId: transfer.id,
      amount: builderAmount,
      platformFee,
    });
  } catch (error) {
    console.error('Error transferring to builder:', error);
    res.status(500).json({ error: 'Failed to transfer funds' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook Error');
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      // Here you would update the user's token balance in the database
      // and create a transaction record
      break;

    case 'account.updated':
      const account = event.data.object as Stripe.Account;
      console.log('Account updated:', account.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
