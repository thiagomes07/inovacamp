import { useState, useEffect, useCallback } from 'react';

interface ApprovedCredit {
  user_id: string;
  total_approved: number;
  count: number;
}

export const useApprovedCredit = (userId: string) => {
  const [approvedCredit, setApprovedCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovedCredit = useCallback(async () => {
    if (!userId) {
      setApprovedCredit(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/credit/approved/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApprovedCredit = await response.json();
      setApprovedCredit(data.total_approved);

      console.log('[useApprovedCredit] Crédito aprovado carregado:', data.total_approved);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar crédito aprovado';
      setError(errorMessage);
      console.error('Erro ao buscar crédito aprovado:', err);
      setApprovedCredit(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchApprovedCredit();
    }
  }, [userId, fetchApprovedCredit]);

  return {
    approvedCredit,
    isLoading,
    error,
    refresh: fetchApprovedCredit
  };
};
