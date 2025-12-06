import { useQuery } from '@tanstack/react-query';
import { useUser } from '../contexts/UserContext';
import { listIdeas, fetchTransactionsByProfile } from '../lib/api';
import { Link } from '@tanstack/react-router';

export default function Profile() {
  const { profileId, displayName, email, tokenBalance, reputation } = useUser();

  const { data: myIdeas } = useQuery({
    queryKey: ['my-ideas', profileId],
    queryFn: async () => {
      const allIdeas = await listIdeas();
      return allIdeas.filter((idea) => idea.creatorProfileId === profileId);
    },
    enabled: !!profileId,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', profileId],
    queryFn: () => fetchTransactionsByProfile(profileId!),
    enabled: !!profileId,
  });

  if (!profileId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-8">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="card mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
            <p className="text-gray-600">{email}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{tokenBalance}</p>
            <p className="text-gray-600">Tokens</p>
            <p className="text-xl font-bold mt-2">{reputation}</p>
            <p className="text-gray-600">Reputation</p>
          </div>
        </div>
        <div className="mt-6">
          <Link to="/buy-tokens" className="btn-primary">
            Buy More Tokens
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">My Ideas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myIdeas?.map((idea) => (
            <Link
              key={idea.id}
              to="/idea/$ideaId"
              params={{ ideaId: idea.id }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{idea.title}</h3>
                <span className="badge-status">{idea.status}</span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{idea.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {idea.totalPledged} / {idea.fundingGoal} tokens
                </span>
              </div>
            </Link>
          ))}
        </div>
        {myIdeas && myIdeas.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            You haven't submitted any ideas yet.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="card">
          <div className="space-y-2">
            {transactions?.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-sm text-gray-600">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`font-bold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
          {transactions && transactions.length === 0 && (
            <p className="text-gray-500 text-center py-8">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
