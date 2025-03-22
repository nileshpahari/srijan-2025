'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('User:', user);
        router.replace(`/profile/${user._id}`); 
      } else {
        router.replace('/login'); 
      }
    }
  }, [user, loading, router]);

  return <p>Redirecting...</p>;
}
