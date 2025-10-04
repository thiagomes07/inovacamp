import { useState, useEffect, useCallback } from 'react';

interface WalletBalance {
  total: number;
  available: number;
  invested: number;
  blocked: number;
}

interface Pool {
  id: string;
  name: string;
  totalCapital: number;
  allocated: number;
  loans: number;
  maxLoans: number;
  averageReturn: number;
  status: 'funding' | 'active' | 'closed';
  is_owner?: boolean;
  invested_amount?: number;
  share_percentage?: number;
}

interface DirectInvestment {
  id: string;
  borrower: string;
  amount: number;
  return: number;
  status: string;
  nextPayment: string | null;
}

interface Opportunity {
  id: string;
  borrower: string;
  amount: number;
  purpose: string;
  rate: number;
  term: number;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Performance {
  total_invested: number;
  total_received: number;
  active_loans: number;
  average_rate: number;
  roi?: number;
  profit?: number;
}

interface PortfolioData {
  investor_id: string;
  balance: WalletBalance;
  pools: Pool[];
  direct_investments: DirectInvestment[];
  opportunities: Opportunity[];
  performance: Performance;
}

export const usePortfolio = (investorId: string) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do backend via HTTP
  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/portfolio/overview?investor_id=${investorId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPortfolioData(data);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar portfólio';
      setError(errorMessage);
      console.error('Erro ao buscar portfólio:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [investorId]);

  // Buscar performance detalhada
  const fetchPerformance = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/portfolio/performance?investor_id=${investorId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao buscar performance:', err);
      return null;
    }
  }, [investorId]);

  // Recarregar dados
  const refresh = useCallback(() => {
    return fetchPortfolio();
  }, [fetchPortfolio]);

  // Carregar dados na montagem ou quando investorId mudar
  useEffect(() => {
    if (investorId) {
      fetchPortfolio();
    }
  }, [investorId, fetchPortfolio]);

  return {
    portfolioData,
    isLoading,
    error,
    refresh,
    fetchPerformance,
    // Dados extraídos para fácil acesso
    balance: portfolioData?.balance || { total: 0, available: 0, invested: 0, blocked: 0 },
    pools: portfolioData?.pools || [],
    directInvestments: portfolioData?.direct_investments || [],
    opportunities: portfolioData?.opportunities || [],
    performance: portfolioData?.performance || { 
      total_invested: 0, 
      total_received: 0, 
      active_loans: 0, 
      average_rate: 0 
    }
  };
};
