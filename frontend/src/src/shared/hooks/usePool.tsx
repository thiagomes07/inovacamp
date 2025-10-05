import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Pool {
  id: string;
  name: string;
  description?: string;
  totalCapital: number;
  availableCapital: number;
  allocatedCapital: number;
  maxLoansCount: number;
  currentLoansCount: number;
  criteria: {
    minScore: number;
    requiresCollateral: boolean;
    collateralTypes: string[];
    minInterestRate: number;
    maxTermMonths: number;
  };
  performance: {
    averageReturn: number;
    totalLoans: number;
    defaultRate: number;
    completedLoans: number;
  };
  status: 'active' | 'paused' | 'completed' | 'draft';
  createdAt: string;
  ownerId: string;
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
  const [pools, setPools] = useState<Pool[]>([
    {
      id: 'pool-1',
      name: 'Diversificação Brasil',
      description: 'Pool focada em diversificação de crédito para pessoas físicas',
      totalCapital: 50000,
      availableCapital: 15000,
      allocatedCapital: 35000,
      maxLoansCount: 10,
      currentLoansCount: 7,
      criteria: {
        minScore: 700,
        requiresCollateral: true,
        collateralTypes: ['vehicle', 'property'],
        minInterestRate: 18,
        maxTermMonths: 12
      },
      performance: {
        averageReturn: 18.5,
        totalLoans: 12,
        defaultRate: 2.1,
        completedLoans: 5
      },
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z',
      ownerId: user?.id || '1'
    },
    {
      id: 'pool-2',
      name: 'Renda Fixa Plus',
      description: 'Pool conservadora para investidores que buscam segurança',
      totalCapital: 25000,
      availableCapital: 0,
      allocatedCapital: 25000,
      maxLoansCount: 5,
      currentLoansCount: 5,
      criteria: {
        minScore: 750,
        requiresCollateral: true,
        collateralTypes: ['property', 'receivables'],
        minInterestRate: 15,
        maxTermMonths: 24
      },
      performance: {
        averageReturn: 16.2,
        totalLoans: 8,
        defaultRate: 0,
        completedLoans: 3
      },
      status: 'completed',
      createdAt: '2024-08-15T10:00:00Z',
      ownerId: user?.id || '1'
    }
  ]);

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

  const createPool = useCallback(async (data: CreatePoolData): Promise<Pool> => {
    setIsLoading(true);

    try {
      // TODO: POST /api/pools
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPool: Pool = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        availableCapital: data.totalCapital,
        allocatedCapital: 0,
        currentLoansCount: 0,
        performance: {
          averageReturn: 0,
          totalLoans: 0,
          defaultRate: 0,
          completedLoans: 0
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        ownerId: user?.id || '1'
      };

      setPools(prev => [newPool, ...prev]);
      return newPool;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updatePool = useCallback(async (poolId: string, updates: Partial<Pool>) => {
    setIsLoading(true);

    try {
      // TODO: PUT /api/pools/:id
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPools(prev => 
        prev.map(pool => 
          pool.id === poolId ? { ...pool, ...updates } : pool
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pausePool = useCallback(async (poolId: string) => {
    await updatePool(poolId, { status: 'paused' });
  }, [updatePool]);

  const resumePool = useCallback(async (poolId: string) => {
    await updatePool(poolId, { status: 'active' });
  }, [updatePool]);

  const increaseCapital = useCallback(async (poolId: string, amount: number) => {
    setIsLoading(true);

    try {
      // TODO: POST /api/pools/:id/increase-capital
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPools(prev => 
        prev.map(pool => 
          pool.id === poolId 
            ? { 
                ...pool, 
                totalCapital: pool.totalCapital + amount,
                availableCapital: pool.availableCapital + amount
              }
            : pool
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    const totalReturn = poolAllocations.reduce((sum, alloc) => sum + alloc.totalPaid, 0);
    const monthlyReturn = totalReturn / Math.max(1, poolAllocations.length); // Simplified
    const utilizationRate = (pool.allocatedCapital / pool.totalCapital) * 100;
    const avgLoanSize = pool.currentLoansCount > 0 
      ? pool.allocatedCapital / pool.currentLoansCount 
      : 0;

    return {
      totalReturn,
      monthlyReturn,
      utilizationRate,
      avgLoanSize
    };
  }, [pools, allocations]);

  const getEligibleBorrowers = useCallback((criteria: Pool['criteria']): number => {
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