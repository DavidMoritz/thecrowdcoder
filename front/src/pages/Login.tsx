import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { profileId } = useUser();

  useEffect(() => {
    if (profileId) {
      navigate({ to: '/' });
    }
  }, [profileId, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-3xl font-bold text-center mb-8">Sign In to The Crowd Coder</h1>
      <Authenticator socialProviders={['google']}>
        {() => <div>Redirecting...</div>}
      </Authenticator>
    </div>
  );
}
