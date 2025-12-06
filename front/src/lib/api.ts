import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

// Profile operations
export async function createProfile(data: {
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const result = await client.models.Profile.create({
    ...data,
    tokenBalance: 0,
    reputation: 0,
    totalProjectsCreated: 0,
    totalProjectsCompleted: 0,
    totalProjectsBacked: 0,
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchProfile(id: string) {
  const result = await client.models.Profile.get({ id });
  return result.data;
}

export async function updateProfile(id: string, data: Partial<Schema['Profile']['type']>) {
  const result = await client.models.Profile.update({ id, ...data });
  return result.data;
}

export async function fetchProfileByEmail(email: string) {
  const result = await client.models.Profile.list({
    filter: { email: { eq: email } }
  });
  return result.data[0] || null;
}

// Idea operations
export async function createIdea(data: {
  title: string;
  description: string;
  problemStatement?: string;
  tags?: string[];
  mockupUrls?: string[];
  creatorProfileId: string;
  fundingGoal: number;
}) {
  const result = await client.models.Idea.create({
    ...data,
    status: 'OPEN',
    totalPledged: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchIdea(id: string) {
  const result = await client.models.Idea.get({ id });
  return result.data;
}

export async function listIdeas(filter?: {
  status?: string;
  tags?: string[];
}) {
  const result = await client.models.Idea.list({
    filter: filter?.status ? { status: { eq: filter.status } } : undefined,
  });
  return result.data;
}

export async function updateIdea(id: string, data: Partial<Schema['Idea']['type']>) {
  const result = await client.models.Idea.update({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
  return result.data;
}

// Comment operations
export async function createComment(data: {
  ideaId: string;
  authorProfileId: string;
  content: string;
  parentCommentId?: string;
}) {
  const result = await client.models.Comment.create({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchCommentsByIdea(ideaId: string) {
  const result = await client.models.Comment.list({
    filter: { ideaId: { eq: ideaId } }
  });
  return result.data;
}

// Pledge operations
export async function createPledge(data: {
  ideaId: string;
  backerProfileId: string;
  tokenAmount: number;
}) {
  const result = await client.models.Pledge.create({
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchPledgesByIdea(ideaId: string) {
  const result = await client.models.Pledge.list({
    filter: { ideaId: { eq: ideaId } }
  });
  return result.data;
}

export async function updatePledge(id: string, data: Partial<Schema['Pledge']['type']>) {
  const result = await client.models.Pledge.update({ id, ...data });
  return result.data;
}

// Bid operations
export async function createBid(data: {
  ideaId: string;
  developerProfileId: string;
  proposedTimeline: string;
  proposedMilestones: string[];
  requestedTokens: number;
  description?: string;
}) {
  const result = await client.models.Bid.create({
    ...data,
    status: 'ACTIVE',
    voteCount: 0,
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchBidsByIdea(ideaId: string) {
  const result = await client.models.Bid.list({
    filter: { ideaId: { eq: ideaId } }
  });
  return result.data;
}

export async function updateBid(id: string, data: Partial<Schema['Bid']['type']>) {
  const result = await client.models.Bid.update({ id, ...data });
  return result.data;
}

// Builder Vote operations
export async function createBuilderVote(data: {
  ideaId: string;
  bidId: string;
  voterProfileId: string;
  weight: number;
}) {
  const result = await client.models.BuilderVote.create({
    ...data,
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchVotesByBid(bidId: string) {
  const result = await client.models.BuilderVote.list({
    filter: { bidId: { eq: bidId } }
  });
  return result.data;
}

export async function fetchVotesByVoter(voterProfileId: string, ideaId: string) {
  const result = await client.models.BuilderVote.list({
    filter: {
      and: [
        { voterProfileId: { eq: voterProfileId } },
        { ideaId: { eq: ideaId } }
      ]
    }
  });
  return result.data;
}

// Milestone operations
export async function createMilestone(data: {
  ideaId: string;
  title: string;
  description?: string;
  tokenAllocation: number;
  order: number;
}) {
  const result = await client.models.Milestone.create({
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchMilestonesByIdea(ideaId: string) {
  const result = await client.models.Milestone.list({
    filter: { ideaId: { eq: ideaId } }
  });
  return result.data.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function updateMilestone(id: string, data: Partial<Schema['Milestone']['type']>) {
  const result = await client.models.Milestone.update({ id, ...data });
  return result.data;
}

// Token Transaction operations
export async function createTokenTransaction(data: {
  profileId: string;
  type: string;
  amount: number;
  relatedIdeaId?: string;
  relatedMilestoneId?: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  description?: string;
}) {
  const result = await client.models.TokenTransaction.create({
    ...data,
    createdAt: new Date().toISOString(),
  });
  return result.data;
}

export async function fetchTransactionsByProfile(profileId: string) {
  const result = await client.models.TokenTransaction.list({
    filter: { profileId: { eq: profileId } }
  });
  return result.data;
}
