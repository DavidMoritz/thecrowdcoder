import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User Profile
  Profile: a
    .model({
      id: a.id().required(),
      email: a.string().required(),
      displayName: a.string().required(),
      bio: a.string(),
      avatarUrl: a.string(),
      tokenBalance: a.integer().default(0),
      reputation: a.integer().default(0),
      stripeCustomerId: a.string(),
      stripeConnectId: a.string(),
      totalProjectsCreated: a.integer().default(0),
      totalProjectsCompleted: a.integer().default(0),
      totalProjectsBacked: a.integer().default(0),
      createdAt: a.datetime(),
      ideas: a.hasMany('Idea', 'creatorProfileId'),
      comments: a.hasMany('Comment', 'authorProfileId'),
      pledges: a.hasMany('Pledge', 'backerProfileId'),
      bids: a.hasMany('Bid', 'developerProfileId'),
      builderVotes: a.hasMany('BuilderVote', 'voterProfileId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Idea/Project
  Idea: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      description: a.string().required(),
      problemStatement: a.string(),
      tags: a.string().array(),
      mockupUrls: a.string().array(),
      status: a.enum([
        'DRAFT',
        'OPEN',
        'FUNDED',
        'BUILDER_SELECTED',
        'IN_PROGRESS',
        'MILESTONE_REVIEW',
        'COMPLETED',
        'DELIVERED',
        'CANCELLED'
      ]),
      creatorProfileId: a.id().required(),
      creator: a.belongsTo('Profile', 'creatorProfileId'),
      fundingGoal: a.integer().required(),
      totalPledged: a.integer().default(0),
      selectedBidderId: a.id(),
      selectedBid: a.belongsTo('Bid', 'selectedBidderId'),
      githubRepoUrl: a.string(),
      liveDemoUrl: a.string(),
      deliveryNotes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      comments: a.hasMany('Comment', 'ideaId'),
      pledges: a.hasMany('Pledge', 'ideaId'),
      bids: a.hasMany('Bid', 'ideaId'),
      milestones: a.hasMany('Milestone', 'ideaId'),
      builderVotes: a.hasMany('BuilderVote', 'ideaId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Comments/Discussion
  Comment: a
    .model({
      id: a.id().required(),
      ideaId: a.id().required(),
      idea: a.belongsTo('Idea', 'ideaId'),
      authorProfileId: a.id().required(),
      author: a.belongsTo('Profile', 'authorProfileId'),
      content: a.string().required(),
      parentCommentId: a.id(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Token Pledges
  Pledge: a
    .model({
      id: a.id().required(),
      ideaId: a.id().required(),
      idea: a.belongsTo('Idea', 'ideaId'),
      backerProfileId: a.id().required(),
      backer: a.belongsTo('Profile', 'backerProfileId'),
      tokenAmount: a.integer().required(),
      status: a.enum(['PENDING', 'ESCROWED', 'RELEASED', 'REFUNDED']),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Developer Bids
  Bid: a
    .model({
      id: a.id().required(),
      ideaId: a.id().required(),
      idea: a.belongsTo('Idea', 'ideaId'),
      developerProfileId: a.id().required(),
      developer: a.belongsTo('Profile', 'developerProfileId'),
      proposedTimeline: a.string().required(),
      proposedMilestones: a.string().array(),
      requestedTokens: a.integer().required(),
      description: a.string(),
      voteCount: a.integer().default(0),
      status: a.enum(['ACTIVE', 'SELECTED', 'REJECTED', 'WITHDRAWN']),
      createdAt: a.datetime(),
      votes: a.hasMany('BuilderVote', 'bidId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Community Votes for Builder Selection
  BuilderVote: a
    .model({
      id: a.id().required(),
      ideaId: a.id().required(),
      idea: a.belongsTo('Idea', 'ideaId'),
      bidId: a.id().required(),
      bid: a.belongsTo('Bid', 'bidId'),
      voterProfileId: a.id().required(),
      voter: a.belongsTo('Profile', 'voterProfileId'),
      weight: a.integer().default(1),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Project Milestones
  Milestone: a
    .model({
      id: a.id().required(),
      ideaId: a.id().required(),
      idea: a.belongsTo('Idea', 'ideaId'),
      title: a.string().required(),
      description: a.string(),
      tokenAllocation: a.integer().required(),
      status: a.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED']),
      submissionNotes: a.string(),
      submissionUrl: a.string(),
      order: a.integer().required(),
      createdAt: a.datetime(),
      completedAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Token Transactions
  TokenTransaction: a
    .model({
      id: a.id().required(),
      profileId: a.id().required(),
      type: a.enum([
        'PURCHASE',
        'PLEDGE',
        'PLEDGE_REFUND',
        'MILESTONE_PAYOUT',
        'PLATFORM_FEE',
        'WITHDRAWAL'
      ]),
      amount: a.integer().required(),
      relatedIdeaId: a.id(),
      relatedMilestoneId: a.id(),
      stripePaymentIntentId: a.string(),
      stripeTransferId: a.string(),
      description: a.string(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
