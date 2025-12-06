import { useQuery } from '@tanstack/react-query';
import { listIdeas } from '../lib/api';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export default function Home() {
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['ideas', filterStatus],
    queryFn: () => listIdeas(filterStatus ? { status: filterStatus } : undefined),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Turn Ideas Into Reality</h1>
        <p className="text-xl text-gray-600 mb-8">
          A platform where anyone can pitch app ideas, the community backs them with tokens,
          and developers build them for rewards.
        </p>
        <Link to="/create-idea" className="btn-primary text-lg px-8 py-3">
          Submit Your Idea
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Ideas</option>
            <option value="OPEN">Open for Funding</option>
            <option value="FUNDED">Funded</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading ideas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas?.map((idea) => (
            <Link
              key={idea.id}
              to="/idea/$ideaId"
              params={{ ideaId: idea.id }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{idea.title}</h3>
                <span className={getStatusBadgeClass(idea.status || '')}>
                  {idea.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
              <div className="flex gap-2 mb-4">
                {idea.tags?.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Funding Progress</span>
                  <div className="font-bold text-lg">
                    {idea.totalPledged} / {idea.fundingGoal} tokens
                  </div>
                </div>
                <div className="text-primary-600 font-medium">
                  {Math.round(((idea.totalPledged || 0) / (idea.fundingGoal || 1)) * 100)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {ideas && ideas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No ideas found. Be the first to submit one!
        </div>
      )}
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'badge-status';
    case 'FUNDED':
      return 'badge-funded';
    case 'COMPLETED':
      return 'badge-completed';
    default:
      return 'badge';
  }
}
