# The Crowd Coder

A community-driven platform where anyone can pitch app ideas, the community backs them with tokens, and developers build them for rewards.

## Overview

The Crowd Coder combines elements of:
- **Kickstarter** (crowdfunding)
- **Stack Overflow / ProductHunt** (community discussion)
- **Upwork / Toptal** (developer marketplace)

But simplified and gamified with a token-based economy.

## How It Works

### 1. Submit an Idea
Anyone can pitch an app or website idea with:
- Title and description
- Problem statement
- Tags (mobile app, web app, AI tool, etc.)
- Funding goal in tokens
- Optional mockups

### 2. Community Discussion
- Public comment threads
- Feature suggestions
- Scope refinement
- Team formation (designers, testers, writers)

### 3. Token Pledging
Users pledge tokens to support ideas they want to see built. Tokens represent real money that will be paid to developers upon completion.

### 4. Developer Bidding
Developers can submit bids including:
- Estimated timeline
- Proposed milestones
- Requested token amount
- Project approach

### 5. Community Voting
The community votes on which developer should build the project, weighted by reputation and reliability.

### 6. Building & Milestones
Once selected, developers work on the project with milestone-based payouts:
- Tokens held in escrow
- Released upon milestone completion
- Platform takes 5% fee

### 7. Delivery
Final product delivered as:
- GitHub repository
- Live demo
- Build files

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TanStack Router** - Routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Backend
- **AWS Amplify** - Backend infrastructure
  - **DynamoDB** - Database
  - **GraphQL** - API layer
  - **Cognito** - Authentication
- **Node.js + Express** - Stripe API endpoints
- **Stripe** - Payment processing & payouts

### Authentication
- **Google OAuth** via AWS Cognito

## Project Structure

```
thecrowdcoder/
├── amplify/                  # AWS Amplify backend
│   ├── auth/                 # Cognito auth config
│   ├── data/                 # GraphQL schema & DynamoDB models
│   └── backend.ts            # Backend definition
├── front/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (UserContext)
│   │   ├── lib/              # API client & utilities
│   │   ├── pages/            # Page components
│   │   ├── index.css         # Global styles
│   │   ├── main.tsx          # App entry point
│   │   └── router.tsx        # Route definitions
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── src/                      # Backend Express API
│   ├── stripe/               # Stripe integration
│   ├── app.ts                # Express app
│   └── server.ts             # Server entry point
├── package.json              # Backend dependencies
└── README.md                 # This file
```

## Database Schema

### Models

#### Profile
User profiles with token balance, reputation, and Stripe account info.

#### Idea
Project ideas with funding goals, status tracking, and deliverables.

#### Comment
Discussion threads on ideas.

#### Pledge
Token pledges from backers to ideas.

#### Bid
Developer proposals to build ideas.

#### BuilderVote
Community votes for selecting developers.

#### Milestone
Project milestones with token allocations.

#### TokenTransaction
All token movements for transparency.

## Features

### Implemented
- ✅ User authentication with Google OAuth
- ✅ Idea submission and browsing
- ✅ Community discussion (comments)
- ✅ Token pledging system
- ✅ Developer bidding
- ✅ Community voting for builder selection
- ✅ Milestone tracking
- ✅ Token purchase via Stripe
- ✅ Builder payouts via Stripe Connect
- ✅ User profiles with reputation
- ✅ Transaction history
- ✅ 5% platform fee
- ✅ Project delivery (GitHub, demo links)

### Future Enhancements
- Email notifications
- Advanced search & filtering
- Idea categories/tags autocomplete
- Developer portfolios
- Reputation system refinement
- Escrow automation
- Dispute resolution
- Admin dashboard
- Analytics & insights
- Mobile app

## Getting Started

### Prerequisites
- Node.js >= 20.19
- npm or yarn
- AWS account
- Stripe account
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thecrowdcoder
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd front
npm install
cd ..
```

4. Set up environment variables:

Create `.env` in project root:
```bash
PORT=3000
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:5173
```

Create `front/.env`:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

5. Configure Amplify secrets:
```bash
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
```

6. Start Amplify sandbox:
```bash
npx ampx sandbox
```

7. Copy generated `amplify_outputs.json` to `front/src/`:
```bash
cp amplify_outputs.json front/src/
```

### Running Locally

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```
Runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd front
npm run dev
```
Runs on `http://localhost:5173`

### Testing

**Backend tests:**
```bash
npm test
```

**Frontend tests:**
```bash
cd front
npm test
```

## Deployment

See [NEXT_STEPS.md](./NEXT_STEPS.md) for detailed deployment instructions including:
- Google OAuth setup
- Stripe configuration
- AWS Amplify deployment
- Domain setup
- Production environment variables

## Token Economy

### Token Pricing
- 1 token = $0.10 USD
- Minimum purchase: 10 tokens ($1.00)

### Platform Fees
- 5% platform fee on all milestone payouts
- Example: 100 token milestone = 95 tokens to developer, 5 tokens platform fee

### Token Flow
1. **User purchases tokens** → Stripe payment → Tokens added to balance
2. **User pledges tokens** → Tokens locked to idea
3. **Idea reaches funding goal** → Tokens moved to escrow
4. **Developer completes milestone** → Tokens released (95% to dev, 5% platform)
5. **Developer withdraws** → Stripe Connect transfer to bank account

## API Endpoints

### GraphQL API (Amplify Data)
- `Profile` CRUD operations
- `Idea` CRUD operations
- `Comment` CRUD operations
- `Pledge` CRUD operations
- `Bid` CRUD operations
- `BuilderVote` CRUD operations
- `Milestone` CRUD operations
- `TokenTransaction` CRUD operations

### REST API (Express + Stripe)
- `POST /api/stripe/create-payment-intent` - Purchase tokens
- `POST /api/stripe/create-connect-account` - Developer onboarding
- `POST /api/stripe/transfer-to-builder` - Milestone payout
- `POST /api/stripe/webhook` - Stripe event handling

## Security

- API Key authentication for Amplify Data
- Stripe webhook signature verification
- CORS configured for specific origins
- Environment variables for all secrets
- HTTPS enforced in production

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/thecrowdcoder/issues)
- Email: support@thecrowdcoder.com

## Acknowledgments

Built with:
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Stripe](https://stripe.com/)
- [React](https://react.dev/)
- [TanStack](https://tanstack.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ for the developer community
