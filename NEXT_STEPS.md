# Next Steps for The Crowd Coder

This document outlines the steps you need to complete to deploy The Crowd Coder platform to production.

## 1. Google OAuth Setup

You need to configure Google OAuth credentials for authentication.

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Create OAuth 2.0 credentials with these redirect URIs:
   - **Development:**
     - `http://localhost:5173`
     - `http://localhost:4173`
   - **Production:**
     - `https://thecrowdcoder.com`
     - `https://www.thecrowdcoder.com`

7. Save your credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## 2. Stripe Setup

You need to set up Stripe for token purchases and builder payouts.

### Steps:
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard:
   - **Test mode keys** (for development):
     - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
     - `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - **Live mode keys** (for production):
     - `STRIPE_SECRET_KEY` (starts with `sk_live_`)
     - `STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)

3. Set up a webhook endpoint:
   - Go to Developers > Webhooks in Stripe Dashboard
   - Add endpoint: `https://thecrowdcoder.com/api/stripe/webhook`
   - Select events to listen to:
     - `payment_intent.succeeded`
     - `account.updated`
   - Save the webhook signing secret: `STRIPE_WEBHOOK_SECRET`

4. Enable Stripe Connect:
   - Go to Connect settings in Stripe Dashboard
   - Enable Express accounts (for developers to receive payouts)

## 3. AWS Amplify Backend Deployment

Deploy the backend to AWS using Amplify.

### Steps:
1. Install Amplify CLI if not already installed:
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Configure Amplify with your AWS credentials:
   ```bash
   amplify configure
   ```

3. Add secrets for Google OAuth:
   ```bash
   npx ampx sandbox secret set GOOGLE_CLIENT_ID
   npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
   ```
   Enter the values from step 1 when prompted.

4. Deploy to sandbox for testing:
   ```bash
   npx ampx sandbox
   ```

5. Once tested, deploy to production:
   ```bash
   npx ampx deploy --branch main
   ```

6. After deployment, copy the generated `amplify_outputs.json` file to:
   - `/front/src/amplify_outputs.json`

## 4. Environment Variables

Set up environment variables for both backend and frontend.

### Backend (.env):
```bash
PORT=3000
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:5173
```

### Frontend (front/.env):
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

For production, update these values with live credentials.

## 5. Install Dependencies

Install all project dependencies.

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd front
npm install
```

## 6. Test Locally

Run the application locally to ensure everything works.

### Terminal 1 - Backend:
```bash
npm run dev
```
Backend will run on `http://localhost:3000`

### Terminal 2 - Frontend:
```bash
cd front
npm run dev
```
Frontend will run on `http://localhost:5173`

### Test the following:
- [ ] Sign in with Google OAuth
- [ ] Create a new idea
- [ ] Purchase tokens (use Stripe test card: 4242 4242 4242 4242)
- [ ] Pledge tokens to an idea
- [ ] Submit a developer bid
- [ ] Vote on a bid
- [ ] Check profile page

## 7. Domain Setup

Configure your domain to point to the deployed application.

### Steps:
1. Configure DNS for `thecrowdcoder.com`:
   - Point A record to Amplify hosting IP (or use Amplify's DNS)
   - Point www CNAME to Amplify hosting

2. Add custom domain in Amplify Console:
   - Go to App Settings > Domain management
   - Add domain: `thecrowdcoder.com`
   - Add subdomain: `www.thecrowdcoder.com`
   - Amplify will auto-configure SSL certificate

3. Update callback URLs in:
   - Google OAuth Console (add production URLs)
   - Amplify auth config (already configured in `amplify/auth/resource.ts`)

## 8. Frontend Production Build

Build and deploy the frontend.

### Steps:
1. Build the frontend:
   ```bash
   cd front
   npm run build
   ```

2. Deploy to Amplify Hosting:
   - Option 1: Connect GitHub repo to Amplify Console for automatic deployments
   - Option 2: Manual deployment:
     ```bash
     npx ampx deploy
     ```

3. Configure build settings in Amplify Console:
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - cd front
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: front/dist
           files:
             - '**/*'
         cache:
           paths:
             - front/node_modules/**/*
   ```

## 9. Backend API Deployment

Deploy the Express backend for Stripe operations.

### Options:

#### Option A: AWS Lambda + API Gateway (Recommended)
1. Install Serverless Framework:
   ```bash
   npm install -g serverless
   ```

2. Create `serverless.yml` in project root
3. Deploy:
   ```bash
   serverless deploy
   ```

#### Option B: AWS EC2 or ECS
1. Set up EC2 instance or ECS cluster
2. Install Node.js and dependencies
3. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.ts --name thecrowdcoder-api
   ```

#### Option C: Railway/Render (Quick Option)
1. Create account on Railway.app or Render.com
2. Connect GitHub repository
3. Configure environment variables
4. Deploy with one click

## 10. Database Initialization

The DynamoDB tables are automatically created by Amplify, but you may want to seed initial data.

### Optional: Create sample data
- Create a few sample ideas
- Add test comments
- Set up initial token balances for testing

## 11. Monitoring & Analytics

Set up monitoring for your production environment.

### Recommended tools:
- **AWS CloudWatch**: Monitor Lambda functions and API Gateway
- **Stripe Dashboard**: Track payments and payouts
- **Amplify Console**: Monitor frontend hosting and builds
- **Sentry** (optional): Error tracking and monitoring

## 12. Security Checklist

Before going live, ensure:

- [ ] All API keys are stored in environment variables (not in code)
- [ ] CORS is properly configured for production domain only
- [ ] Stripe webhook signature verification is enabled
- [ ] Rate limiting is implemented on API endpoints (consider AWS API Gateway throttling)
- [ ] Input validation is in place for all user inputs
- [ ] HTTPS is enforced on all endpoints
- [ ] Google OAuth redirect URIs are restricted to your domain

## 13. Legal & Compliance

Before launching:

- [ ] Create Terms of Service
- [ ] Create Privacy Policy (especially for payment processing)
- [ ] Set up Stripe compliance requirements
- [ ] Consider PCI compliance for payment handling
- [ ] Add cookie consent (if required by GDPR/CCPA)

## 14. Launch Checklist

Final steps before public launch:

- [ ] Switch from Stripe test mode to live mode
- [ ] Update all environment variables to production values
- [ ] Test end-to-end payment flow in production
- [ ] Set up backup strategy for DynamoDB
- [ ] Configure email notifications (consider AWS SES)
- [ ] Create admin dashboard for platform management (optional)
- [ ] Set up customer support system
- [ ] Plan marketing strategy

## Support & Resources

- **Amplify Documentation**: https://docs.amplify.aws/
- **Stripe Documentation**: https://stripe.com/docs
- **Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
- **TanStack Router**: https://tanstack.com/router
- **React Query**: https://tanstack.com/query

## Cost Estimates

### AWS Amplify:
- Data (DynamoDB): Pay per request (~$0.25 per million reads)
- Auth (Cognito): First 50,000 MAU free, then $0.0055/MAU
- Hosting: ~$0.15/GB served + $0.01/build minute

### Stripe:
- 2.9% + $0.30 per transaction
- Stripe Connect (payouts): Additional fees apply

### Monthly estimate for 1,000 active users:
- AWS: ~$10-50/month
- Stripe fees: Variable based on transaction volume
- Domain: ~$12/year

---

Once you complete these steps, The Crowd Coder will be fully operational! 🚀
