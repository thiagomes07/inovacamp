import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:8000/api/v1';

export interface PoolData {
  id: string;
  name: string;
  totalCapital: number;
  allocated: number;
  loans: number;
  maxLoans: number;
  averageReturn: number;
  status: string;
}

export interface DirectInvestment {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: string;
  nextPayment: string;
}

export interface Opportunity {
  id: string;
  borrowerType: string;
  requestedAmount: number;
  purpose: string;
  interestRate: number;
  termMonths: number;
  score: number;
  hasCollateral: boolean;
}

export interface PortfolioData {
  balance: number;
  totalInvested: number;
  activeInvestments: number;
  totalReturn: number;
  monthlyReturn: number;
  pools: PoolData[];
  directInvestments: DirectInvestment[];
  opportunities: Opportunity[];
}

interface UsePortfolioReturn {
  portfolioData: PortfolioData | null;
  balance: number;
  pools: PoolData[];
  directInvestments: DirectInvestment[];
  opportunities: Opportunity[];
  performance: {
    totalReturn: number;
    monthlyReturn: number;
    total_invested: number;
    total_received: number;
    active_loans: number;
    average_rate: number;
  };
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePortfolio = (investorId: string): UsePortfolioReturn => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!investorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/portfolio/overview?investor_id=${investorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      setPortfolioData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [investorId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Calcular métricas de performance baseado nos dados
  const calculatePerformance = () => {
    if (!portfolioData) {
      return {
        totalReturn: 0,
        monthlyReturn: 0,
        total_invested: 0,
        total_received: 0,
        active_loans: 0,
        average_rate: 0
      };
    }

    // Somar investimentos ativos dos pools e investimentos diretos
    const totalInvested = (portfolioData.pools || []).reduce((sum, pool) => sum + pool.allocated, 0);
    
    // Contar empréstimos ativos
    const activeLoans = (portfolioData.pools || []).reduce((sum, pool) => sum + (pool.loans || 0), 0)
      + (portfolioData.directInvestments || []).filter(inv => inv.status === 'active').length;
    
    // Calcular taxa média dos pools
    const poolsWithLoans = (portfolioData.pools || []).filter(p => p.loans > 0);
    const averageRate = poolsWithLoans.length > 0
      ? poolsWithLoans.reduce((sum, pool) => sum + pool.averageReturn, 0) / poolsWithLoans.length
      : 0;

    return {
      totalReturn: portfolioData.totalReturn || 0,
      monthlyReturn: portfolioData.monthlyReturn || 0,
      total_invested: totalInvested,
      total_received: portfolioData.totalReturn || 0,
      active_loans: activeLoans,
      average_rate: averageRate
    };
  };

  return {
    portfolioData,
    balance: portfolioData?.balance || 0,
    pools: portfolioData?.pools || [],
    directInvestments: portfolioData?.directInvestments || [],
    opportunities: portfolioData?.opportunities || [],
    performance: calculatePerformance(),
    isLoading,
    error,
    refresh: fetchPortfolio
  };
};