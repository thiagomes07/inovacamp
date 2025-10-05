import { useState, useEffect, useCallback } from 'react';

interface Loan {
  id: string;
  amount: number;
  nextPayment: number;
  daysUntilPayment: number;
  source: string;
  type: 'pool' | 'direct';
  status: string;
  interest_rate: number;
  term_months: number;
  amount_paid: number;
  created_at: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

interface Statistics {
  total_borrowed: number;
  total_paid: number;
  total_remaining: number;
  active_loans_count: number;
}

interface BorrowerDashboardData {
  user_id: string;
  active_loans: Loan[];
  recent_transactions: Transaction[];
  statistics: Statistics;
}

export const useBorrowerDashboard = (userId: string) => {
  const [dashboardData, setDashboardData] = useState<BorrowerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do dashboard via HTTP
  const fetchDashboard = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/credit/dashboard/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dashboard';
      setError(errorMessage);
      console.error('Erro ao buscar dashboard do tomador:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Recarregar dados
  const refresh = useCallback(() => {
    return fetchDashboard();
  }, [fetchDashboard]);

  // Carregar dados na montagem ou quando userId mudar
  useEffect(() => {
    if (userId) {
      fetchDashboard();
    }
  }, [userId, fetchDashboard]);

  return {
    dashboardData,
    isLoading,
    error,
    refresh,
    // Dados extraídos para fácil acesso
    activeLoans: dashboardData?.active_loans || [],
    recentTransactions: dashboardData?.recent_transactions || [],
    statistics: dashboardData?.statistics || {
      total_borrowed: 0,
      total_paid: 0,
      total_remaining: 0,
      active_loans_count: 0
    }
  };
};
