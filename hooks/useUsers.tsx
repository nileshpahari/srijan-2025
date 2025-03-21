'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  branch: string;
  skills: string[];
  bio: string;
  linkedin?: string;
  github?: string;
}

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    if (!user) return [];

    try {
      setLoading(true);
      const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    searchUsers,
  };
}