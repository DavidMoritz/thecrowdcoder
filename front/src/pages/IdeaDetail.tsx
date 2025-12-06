import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIdea,
  fetchCommentsByIdea,
  createComment,
  createPledge,
  fetchPledgesByIdea,
  fetchBidsByIdea,
  createBid,
  fetchVotesByVoter,
  createBuilderVote,
  updateBid,
  updateIdea,
  fetchMilestonesByIdea,
  updateMilestone,
  updateProfile,
  fetchProfile,
} from '../lib/api';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';

export default function IdeaDetail() {
  const { ideaId } = useParams({ from: '/idea/$ideaId' });
  const { profileId, tokenBalance, refreshProfile } = useUser();
  const queryClient = useQueryClient();

  const [commentContent, setCommentContent] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('10');
  const [showBidForm, setShowBidForm] = useState(false);

  const { data: idea, isLoading } = useQuery({
    queryKey: ['idea', ideaId],
    queryFn: () => fetchIdea(ideaId),
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', ideaId],
    queryFn: () => fetchCommentsByIdea(ideaId),
  });

  const { data: pledges } = useQuery({
    queryKey: ['pledges', ideaId],
    queryFn: () => fetchPledgesByIdea(ideaId),
  });

  const { data: bids } = useQuery({
    queryKey: ['bids', ideaId],
    queryFn: () => fetchBidsByIdea(ideaId),
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones', ideaId],
    queryFn: () => fetchMilestonesByIdea(ideaId),
    enabled: idea?.status === 'IN_PROGRESS' || idea?.status === 'COMPLETED',
  });

  const { data: userVotes } = useQuery({
    queryKey: ['votes', ideaId, profileId],
    queryFn: () => fetchVotesByVoter(profileId!, ideaId),
    enabled: !!profileId,
  });

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
      setCommentContent('');
    },
  });

  const pledgeMutation = useMutation({
    mutationFn: async (data: { ideaId: string; backerProfileId: string; tokenAmount: number }) => {
      const pledge = await createPledge(data);
      await updateIdea(ideaId, {
        totalPledged: (idea?.totalPledged || 0) + data.tokenAmount,
      });
      const profile = await fetchProfile(profileId!);
      await updateProfile(profileId!, {
        tokenBalance: (profile?.tokenBalance || 0) - data.tokenAmount,
        totalProjectsBacked: (profile?.totalProjectsBacked || 0) + 1,
      });
      return pledge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['pledges', ideaId] });
      refreshProfile();
      setPledgeAmount('10');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const vote = await createBuilderVote({
        ideaId,
        bidId,
        voterProfileId: profileId!,
        weight: 1,
      });
      const bid = bids?.find((b) => b.id === bidId);
      if (bid) {
        await updateBid(bidId, {
          voteCount: (bid.voteCount || 0) + 1,
        });
      }
      return vote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['votes', ideaId, profileId] });
    },
  });

  const milestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      await updateMilestone(milestoneId, {
        status: 'APPROVED',
        completedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', ideaId] });
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    commentMutation.mutate({
      ideaId,
      authorProfileId: profileId,
      content: commentContent,
    });
  };

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    const amount = parseInt(pledgeAmount);
    if (amount > tokenBalance) {
      alert('Insufficient token balance');
      return;
    }
    pledgeMutation.mutate({
      ideaId,
      backerProfileId: profileId,
      tokenAmount: amount,
    });
  };

  const handleVote = (bidId: string) => {
    if (!profileId) return;
    if (userVotes?.some((v) => v.bidId === bidId)) {
      alert('You have already voted for this bid');
      return;
    }
    voteMutation.mutate(bidId);
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Loading...</div>;
  }

  if (!idea) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Idea not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold">{idea.title}</h1>
              <span className="badge-status">{idea.status}</span>
            </div>

            <div className="mb-6">
              <h2 className="font-bold text-lg mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
            </div>

            {idea.problemStatement && (
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">Problem Statement</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{idea.problemStatement}</p>
              </div>
            )}

            <div className="flex gap-2">
              {idea.tags?.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-700">
                  {tag}
                </span>
              ))}
            </div>

            {idea.githubRepoUrl && (
              <div className="mt-6">
                <h2 className="font-bold text-lg mb-2">Deliverables</h2>
                <a
                  href={idea.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  GitHub Repository
                </a>
                {idea.liveDemoUrl && (
                  <>
                    {' | '}
                    <a
                      href={idea.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Live Demo
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          {milestones && milestones.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Milestones</h2>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="border-l-4 border-primary-600 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{milestone.title}</h3>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{milestone.tokenAllocation} tokens</span>
                        </p>
                      </div>
                      <span className="badge-status">{milestone.status}</span>
                    </div>
                    {milestone.status === 'SUBMITTED' && profileId === idea.creatorProfileId && (
                      <button
                        onClick={() => milestoneMutation.mutate(milestone.id)}
                        className="btn-primary mt-2"
                      >
                        Approve Milestone
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Discussion</h2>
            {profileId && (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="textarea mb-2"
                  placeholder="Share your thoughts..."
                  required
                />
                <button type="submit" className="btn-primary">
                  Post Comment
                </button>
              </form>
            )}
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="border-l-2 border-gray-300 pl-4">
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(comment.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {(idea.status === 'OPEN' || idea.status === 'FUNDED') && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Developer Bids</h2>
              {profileId && (
                <button
                  onClick={() => setShowBidForm(!showBidForm)}
                  className="btn-primary mb-4"
                >
                  {showBidForm ? 'Cancel' : 'Submit a Bid'}
                </button>
              )}
              {showBidForm && <BidForm ideaId={ideaId} profileId={profileId!} onClose={() => setShowBidForm(false)} />}
              <div className="space-y-4 mt-6">
                {bids?.map((bid) => (
                  <div key={bid.id} className="card bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">Bid for {bid.requestedTokens} tokens</h3>
                      <span className="badge-status">{bid.voteCount || 0} votes</span>
                    </div>
                    <p className="text-gray-700 mb-2">{bid.description}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Timeline:</strong> {bid.proposedTimeline}
                    </p>
                    <div className="mb-2">
                      <strong className="text-sm">Milestones:</strong>
                      <ul className="list-disc list-inside text-sm">
                        {bid.proposedMilestones?.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    {profileId && !userVotes?.some((v) => v.bidId === bid.id) && (
                      <button onClick={() => handleVote(bid.id)} className="btn-primary">
                        Vote for this Builder
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Funding</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-bold">
                  {Math.round(((idea.totalPledged || 0) / (idea.fundingGoal || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((idea.totalPledged || 0) / (idea.fundingGoal || 1)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold">
                {idea.totalPledged} / {idea.fundingGoal}
              </p>
              <p className="text-gray-600">tokens pledged</p>
            </div>
            <div className="mb-4">
              <p className="text-lg font-bold">{pledges?.length || 0}</p>
              <p className="text-gray-600">backers</p>
            </div>

            {profileId && idea.status === 'OPEN' && (
              <form onSubmit={handlePledge}>
                <label className="block font-medium mb-2">Pledge Tokens</label>
                <input
                  type="number"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  className="input mb-2"
                  min="1"
                  max={tokenBalance}
                />
                <p className="text-sm text-gray-500 mb-2">
                  Your balance: {tokenBalance} tokens
                </p>
                <button type="submit" className="btn-primary w-full">
                  Back This Idea
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BidForm({ ideaId, profileId, onClose }: { ideaId: string; profileId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [timeline, setTimeline] = useState('');
  const [milestones, setMilestones] = useState('');
  const [requestedTokens, setRequestedTokens] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: createBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', ideaId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ideaId,
      developerProfileId: profileId,
      proposedTimeline: timeline,
      proposedMilestones: milestones.split('\n').filter(Boolean),
      requestedTokens: parseInt(requestedTokens),
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-gray-50 mb-4">
      <h3 className="font-bold mb-4">Submit Your Bid</h3>
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Timeline</label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="input"
            placeholder="e.g., 4 weeks"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Requested Tokens</label>
          <input
            type="number"
            value={requestedTokens}
            onChange={(e) => setRequestedTokens(e.target.value)}
            className="input"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea"
            placeholder="How will you approach this project?"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Milestones (one per line)</label>
          <textarea
            value={milestones}
            onChange={(e) => setMilestones(e.target.value)}
            className="textarea"
            placeholder="Set up project&#10;Implement core features&#10;Testing and deployment"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Submit Bid
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
