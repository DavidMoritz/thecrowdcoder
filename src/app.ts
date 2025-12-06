import express from 'express';
import cors from 'cors';
import stripeRoutes from './stripe/routes.js';

const app = express();

app.use(cors());

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Stripe routes
app.use('/api/stripe', stripeRoutes);

export default app;
