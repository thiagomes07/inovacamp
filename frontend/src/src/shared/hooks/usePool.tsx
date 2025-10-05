import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

const API_URL = 'http://localhost:8000/api/v1';

export interface Pool {
  id: string;
  name: string;
  description?: string;
  totalCapital: number;
  availableCapital?: number;
  allocatedCapital?: number;
  allocatedAmount?: number;
  availableAmount?: number;
  maxLoansCount?: number;
  currentLoansCount?: number;
  criteria?: {
    minScore: number;
    requiresCollateral: boolean;
    collateralTypes: string[];
    minInterestRate: number;
    maxTermMonths: number;
  };
  performance?: {
    averageReturn: number;
    totalLoans: number;
    defaultRate: number;
    completedLoans: number;
  };
  status: 'active' | 'funding' | 'closed' | 'draft';
  createdAt: string;
  ownerId?: string;
  investorId?: string;
  expectedReturn?: number;
  averageReturn?: number;
  completedLoans?: number;
  durationMonths?: number;
  riskProfile?: string;
  loans?: PoolAllocation[];
}

export interface PoolAllocation {
  id: string;
  poolId: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  score: number;
  collateral?: {
    type: string;
    description: string;
    value: number;
  };
  status: 'active' | 'completed' | 'overdue';
  nextPaymentDate: string;
  totalPaid: number;
  remainingAmount: number;
  allocatedAt: string;
}

export interface CreatePoolData {
  name: string;
  description?: string;
  totalCapital: number;
  maxLoansCount: number;
  criteria: {
    minScore: number;
    requiresCollateral: boolean;
    collateralTypes: string[];
    minInterestRate: number;
    maxTermMonths: number;
  };
}

interface UsePoolReturn {
  pools: Pool[];
  allocations: PoolAllocation[];
  isLoading: boolean;
  createPool: (data: CreatePoolData) => Promise<Pool>;
  updatePool: (poolId: string, updates: Partial<Pool>) => Promise<void>;
  pausePool: (poolId: string) => Promise<void>;
  resumePool: (poolId: string) => Promise<void>;
  increaseCapital: (poolId: string, amount: number) => Promise<void>;
  getPoolStats: (poolId: string) => {
    totalReturn: number;
    monthlyReturn: number;
    utilizationRate: number;
    avgLoanSize: number;
  };
  getEligibleBorrowers: (criteria: Pool['criteria']) => number;
}

export const usePool = (): UsePoolReturn => {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);

  const [allocations, setAllocations] = useState<PoolAllocation[]>([
    {
      id: 'alloc-1',
      poolId: 'pool-1',
      borrowerId: 'borrower-1',
      borrowerName: 'Maria Silva Santos',
      amount: 5000,
      interestRate: 18.5,
      termMonths: 12,
      score: 750,
      collateral: {
        type: 'vehicle',
        description: 'Honda Civic 2020',
        value: 80000
      },
      status: 'active',
      nextPaymentDate: '2024-11-01',
      totalPaid: 493.75,
      remainingAmount: 4506.25,
      allocatedAt: '2024-10-01T10:00:00Z'
    },
    {
      id: 'alloc-2',
      poolId: 'pool-1',
      borrowerId: 'borrower-2',
      borrowerName: 'João Pedro Costa',
      amount: 8000,
      interestRate: 19.2,
      termMonths: 18,
      score: 720,
      collateral: {
        type: 'property',
        description: 'Apartamento 2 quartos - SP',
        value: 350000
      },
      status: 'active',
      nextPaymentDate: '2024-11-05',
      totalPaid: 1200,
      remainingAmount: 7800,
      allocatedAt: '2024-09-15T10:00:00Z'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch pools on mount
  useEffect(() => {
    if (user?.id) {
      fetchPools();
    }
  }, [user?.id]);

  const fetchPools = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/pool/investor/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pools');
      
      const data = await response.json();
      setPools(data);
    } catch (error) {
      console.error('Error fetching pools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createPool = useCallback(async (data: CreatePoolData): Promise<Pool> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create pool');
      
      const result = await response.json();
      const newPool = result.data;
      
      setPools(prev => [newPool, ...prev]);
      return newPool;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePool = useCallback(async (poolId: string, updates: Partial<Pool>) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/pool/${poolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update pool');
      
      const updatedPool = await response.json();
      
      setPools(prev => 
        prev.map(pool => 
          pool.id === poolId ? { ...pool, ...updatedPool } : pool
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pausePool = useCallback(async (poolId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/pool/${poolId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'funding' })
      });

      if (!response.ok) throw new Error('Failed to pause pool');
      
      await fetchPools(); // Refresh pools
    } finally {
      setIsLoading(false);
    }
  }, [fetchPools]);

  const resumePool = useCallback(async (poolId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/pool/${poolId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (!response.ok) throw new Error('Failed to resume pool');
      
      await fetchPools(); // Refresh pools
    } finally {
      setIsLoading(false);
    }
  }, [fetchPools]);

  const increaseCapital = useCallback(async (poolId: string, amount: number) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/pool/${poolId}/increase-capital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('Failed to increase capital');
      
      await fetchPools(); // Refresh pools
    } finally {
      setIsLoading(false);
    }
  }, [fetchPools]);

  const getPoolStats = useCallback((poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    const poolAllocations = allocations.filter(a => a.poolId === poolId);

    if (!pool) {
      return {
        totalReturn: 0,
        monthlyReturn: 0,
        utilizationRate: 0,
        avgLoanSize: 0
      };
    }

    const allocatedCapital = pool.allocatedAmount || pool.allocatedCapital || 0;
    const currentLoansCount = pool.currentLoansCount || poolAllocations.length;

    const totalReturn = poolAllocations.reduce((sum, alloc) => sum + alloc.totalPaid, 0);
    const monthlyReturn = totalReturn / Math.max(1, poolAllocations.length);
    const utilizationRate = (allocatedCapital / pool.totalCapital) * 100;
    const avgLoanSize = currentLoansCount > 0 
      ? allocatedCapital / currentLoansCount 
      : 0;

    return {
      totalReturn,
      monthlyReturn,
      utilizationRate,
      avgLoanSize
    };
  }, [pools, allocations]);

  const getEligibleBorrowers = useCallback((criteria: Pool['criteria']): number => {
    if (!criteria) return 0;
    
    // Mock calculation of eligible borrowers based on criteria
    let baseEligible = 1000; // Base number of users

    // Reduce based on score requirement
    if (criteria.minScore >= 800) baseEligible *= 0.15;
    else if (criteria.minScore >= 750) baseEligible *= 0.30;
    else if (criteria.minScore >= 700) baseEligible *= 0.45;
    else if (criteria.minScore >= 650) baseEligible *= 0.60;
    else if (criteria.minScore >= 600) baseEligible *= 0.75;

    // Reduce if collateral is required
    if (criteria.requiresCollateral) {
      baseEligible *= 0.40;
    }

    // Reduce based on interest rate requirement
    if (criteria.minInterestRate >= 25) baseEligible *= 0.60;
    else if (criteria.minInterestRate >= 20) baseEligible *= 0.75;
    else if (criteria.minInterestRate >= 18) baseEligible *= 0.85;

    return Math.round(baseEligible);
  }, []);

  return {
    pools,
    allocations,
    isLoading,
    createPool,
    updatePool,
    pausePool,
    resumePool,
    increaseCapital,
    getPoolStats,
    getEligibleBorrowers
  };
};