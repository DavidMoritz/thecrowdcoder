import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIdea } from '../lib/api';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from '@tanstack/react-router';

export default function CreateIdea() {
  const { profileId } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [tags, setTags] = useState('');
  const [fundingGoal, setFundingGoal] = useState('100');

  const mutation = useMutation({
    mutationFn: createIdea,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      if (data) {
        navigate({ to: '/idea/$ideaId', params: { ideaId: data.id } });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileId) {
      alert('Please sign in to submit an idea');
      return;
    }

    mutation.mutate({
      title,
      description,
      problemStatement,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      fundingGoal: parseInt(fundingGoal),
      creatorProfileId: profileId,
    });
  };

  if (!profileId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-8">Please sign in to submit an idea.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Submit Your App Idea</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Catchy name for your idea"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              placeholder="Describe your app idea in detail"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Problem Statement (Optional)</label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="textarea"
              placeholder="What problem does this solve?"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="web app, mobile, AI, marketplace"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Funding Goal (tokens)</label>
            <input
              type="number"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              className="input"
              min="1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              How many tokens should be pooled for this project?
            </p>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Idea'}
          </button>
        </div>
      </form>
    </div>
  );
}
