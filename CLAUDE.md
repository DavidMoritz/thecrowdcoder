# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Crowd Coder is a community-driven platform combining crowdfunding, developer marketplace, and community discussion. Users pitch app ideas, community backs them with tokens, and developers build them for rewards with milestone-based payouts.

## Architecture

### Monorepo Structure

This is a monorepo with three main components:

1. **Backend API** (`/src`) - Express.js server for Stripe integration
2. **Frontend** (`/front`) - React 19 application with Vite
3. **AWS Amplify Backend** (`/amplify`) - GraphQL API, DynamoDB, and Cognito auth

### Key Architectural Patterns

**Dual Backend Architecture**: The application uses two backend systems:
- **Amplify Data (GraphQL)**: Handles all database operations (Profile, Idea, Comment, Pledge, Bid, Milestone, etc.) via AWS AppSync and DynamoDB
- **Express API** (`/src`): Handles Stripe-specific operations (payments, Connect onboarding, transfers, webhooks)

**Frontend State Management**:
- **TanStack Router**: File-based routing (routes defined in `front/src/router.tsx`)
- **TanStack Query**: Server state caching and synchronization
- **UserContext** (`front/src/contexts/UserContext.tsx`): Global user profile state, auto-creates Profile on first login

**Authentication Flow**:
1. Google OAuth via AWS Cognito
2. On successful auth, UserContext fetches user email from Cognito
3. UserContext queries Profile table by email
4. If no profile exists, creates one automatically
5. Profile ID is used throughout the app for all operations

**Token Economy**:
- 1 token = $0.10 USD
- All token operations use integer token amounts (not cents)
- Stripe integration converts tokens to cents (multiply by 10)
- 5% platform fee on milestone payouts (defined in `src/stripe/routes.ts:9`)

## Development Commands

### Initial Setup

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd front && npm install && cd ..

# Configure Amplify secrets (required for Google OAuth)
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET

# Start Amplify sandbox (generates amplify_outputs.json)
npx ampx sandbox

# Copy Amplify outputs to frontend
cp amplify_outputs.json front/src/
```

### Running the Application

**Terminal 1 - Amplify Sandbox** (must run first):
```bash
npx ampx sandbox
```
This generates `amplify_outputs.json` which contains the GraphQL endpoint, API key, and Cognito config.

**Terminal 2 - Backend API**:
```bash
npm run dev
```
Runs Express server on port 3000 with hot reload via tsx watch.

**Terminal 3 - Frontend**:
```bash
cd front
npm run dev
```
Runs Vite dev server on port 5173.

### Building and Testing

```bash
# Build backend (TypeScript compilation)
npm run build

# Build frontend (TypeScript + Vite)
cd front && npm run build

# Run backend tests
npm test

# Run frontend tests
cd front && npm test

# Lint frontend
cd front && npm run lint
```

## Important Files and Locations

### Database Schema
- `amplify/data/resource.ts` - Complete GraphQL schema with all models and relationships
- Uses AWS Amplify's `a.schema()` DSL for type-safe schema definition
- Authorization mode: `publicApiKey` (365-day expiration)

### API Client
- `front/src/lib/api.ts` - All GraphQL operations (CRUD for each model)
- Generated client from `amplify/data/resource.ts` schema
- All functions auto-generate timestamps (createdAt, updatedAt)

### Stripe Integration
- `src/stripe/routes.ts` - All Stripe endpoints:
  - `/api/stripe/create-payment-intent` - Token purchases
  - `/api/stripe/create-connect-account` - Developer onboarding
  - `/api/stripe/transfer-to-builder` - Milestone payouts (with 5% fee)
  - `/api/stripe/webhook` - Stripe event handling
- Webhook requires raw body parsing (configured in `src/app.ts`)

### Route Definitions
- `front/src/router.tsx` - All routes:
  - `/` - Home (idea browsing)
  - `/login` - Authentication
  - `/create-idea` - Idea submission
  - `/idea/$ideaId` - Idea detail (comments, pledges, bids, milestones)
  - `/profile` - User profile
  - `/buy-tokens` - Token purchase

## Database Schema Details

### Critical Relationships

**Profile** → Has many Ideas (as creator), Comments, Pledges, Bids, BuilderVotes

**Idea** → Has many Comments, Pledges, Bids, Milestones, BuilderVotes
- `status`: DRAFT | OPEN | FUNDED | BUILDER_SELECTED | IN_PROGRESS | MILESTONE_REVIEW | COMPLETED | DELIVERED | CANCELLED
- `selectedBidderId`: References Bid.id when builder is chosen

**Pledge** → Belongs to Idea and Profile
- `status`: PENDING | ESCROWED | RELEASED | REFUNDED

**Bid** → Belongs to Idea and Profile (as developer)
- Has many BuilderVotes
- `status`: ACTIVE | SELECTED | REJECTED | WITHDRAWN

**Milestone** → Belongs to Idea
- `status`: PENDING | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED
- `order`: Integer for ordering milestones

## Environment Variables

**Root `.env`** (Backend):
```
PORT=3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

**`front/.env`** (Frontend):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Amplify Secrets** (via CLI):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Common Workflows

### Adding a New Model to the Schema

1. Edit `amplify/data/resource.ts`
2. Add model definition using `a.model({...})`
3. Add relationships (hasMany, belongsTo)
4. Amplify sandbox auto-regenerates schema
5. Re-copy `amplify_outputs.json` to `front/src/`
6. Add CRUD functions in `front/src/lib/api.ts`

### Working with GraphQL Queries

The Amplify client uses a type-safe API. All operations return `{ data, errors }`:

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

// List with filter
const result = await client.models.Idea.list({
  filter: { status: { eq: 'OPEN' } }
});

// Get by ID
const idea = await client.models.Idea.get({ id: 'abc123' });

// Create
const newIdea = await client.models.Idea.create({
  title: 'My Idea',
  // ... other fields
});

// Update
const updated = await client.models.Idea.update({
  id: 'abc123',
  status: 'FUNDED'
});
```

### Handling Stripe Webhooks

Webhooks must verify signature before processing:
1. Request arrives at `/api/stripe/webhook` with raw body
2. Signature verified using `stripe.webhooks.constructEvent()`
3. Event type switch handles specific events
4. Database updates happen via GraphQL mutations (not in webhook handler currently)

## TypeScript Configuration

- Backend: ES modules (`"type": "module"` in root `package.json`)
- Frontend: Vite + React with strict TypeScript
- Shared types from `amplify/data/resource.ts` via `Schema` export

## Testing Notes

- Backend tests: Vitest
- Frontend tests: Vitest + jsdom
- No test files currently present in the codebase

## Deployment

The application is designed to deploy to:
- **AWS Amplify** (frontend + Amplify backend)
- **Separate backend service** for Express API (e.g., Railway, Render, EC2)

Production requires:
- Google OAuth credentials
- Stripe account with Connect enabled
- AWS account for Amplify
- Domain configuration for callback URLs
