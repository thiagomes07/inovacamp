import { useState, useEffect, useCallback } from 'react';

interface ScoreData {
  user_id: string;
  full_name: string;
  score: number;
  calculated_score: number;
  documents_uploaded: number;
  financial_docs_uploaded: number;
}

export const useScore = (userId: string) => {
  const [score, setScore] = useState<number>(0);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/v1/score/${userId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar score');
      }

      const data: ScoreData = await response.json();
      
      console.log('[useScore] Score atualizado:', data);
      
      setScoreData(data);
      setScore(data.score);
    } catch (err) {
      console.error('[useScore] Erro ao buscar score:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    scoreData,
    isLoading,
    error,
    refresh: fetchScore,
  };
};
