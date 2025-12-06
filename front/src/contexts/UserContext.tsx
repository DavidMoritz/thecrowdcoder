import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { fetchProfileByEmail, createProfile } from '../lib/api';

interface UserContextType {
  profileId: string | null;
  email: string | null;
  displayName: string | null;
  tokenBalance: number;
  reputation: number;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const userEmail = attributes.email || '';
      setEmail(userEmail);

      let profile = await fetchProfileByEmail(userEmail);

      if (!profile && userEmail) {
        profile = await createProfile({
          email: userEmail,
          displayName: attributes.name || userEmail.split('@')[0],
        });
      }

      if (profile) {
        setProfileId(profile.id);
        setDisplayName(profile.displayName || '');
        setTokenBalance(profile.tokenBalance || 0);
        setReputation(profile.reputation || 0);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfileId(null);
      setEmail(null);
      setDisplayName(null);
      setTokenBalance(0);
      setReputation(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{
        profileId,
        email,
        displayName,
        tokenBalance,
        reputation,
        isLoading,
        refreshProfile: loadUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
