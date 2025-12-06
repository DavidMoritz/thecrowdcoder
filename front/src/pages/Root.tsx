import { Outlet, Link } from '@tanstack/react-router';
import { useUser } from '../contexts/UserContext';
import { signOut } from 'aws-amplify/auth';

export default function Root() {
  const { displayName, tokenBalance, profileId } = useUser();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                The Crowd Coder
              </Link>
              <div className="flex gap-4">
                <Link to="/" className="text-gray-700 hover:text-primary-600">
                  Explore
                </Link>
                {profileId && (
                  <Link to="/create-idea" className="text-gray-700 hover:text-primary-600">
                    Submit Idea
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profileId ? (
                <>
                  <Link to="/buy-tokens" className="btn-outline">
                    {tokenBalance} Tokens
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                    {displayName}
                  </Link>
                  <button onClick={handleSignOut} className="btn-secondary">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 The Crowd Coder. Community-driven app development.</p>
        </div>
      </footer>
    </div>
  );
}
