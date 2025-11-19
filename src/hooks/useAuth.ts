import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const auth = useAuthContext();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}

// Hook that doesn't redirect (for pages that can handle unauthenticated state)
export function useAuthOptional() {
  return useAuthContext();
}