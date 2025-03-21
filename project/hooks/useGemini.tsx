'use client';

import { useState } from 'react';

export function useGemini() {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async (prompt: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestions,
    loading,
    error,
    generateSuggestions,
  };
}