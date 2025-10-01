import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'borrower' | 'lender';
export type BorrowerType = 'autonomous' | 'clt' | 'company';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  borrowerType?: BorrowerType;
  avatar?: string;
  creditScore: number;
  kycCompleted: boolean;
  biometricsEnabled: boolean;
  twoFactorEnabled: boolean;
  linkedBanks: string[];
  balances: {
    fiat: number;
    stablecoin: number;
    currency: string;
  };
}

export interface Loan {
  id: string;
  amount: number;
  currency: string;
  interestRate: number;
  dueDate: string;
  status: 'pending' | 'active' | 'overdue' | 'paid';
  borrowerId?: string;
  lenderId?: string;
  installments?: number;
  paidInstallments?: number;
}

export interface CreditRequest {
  id: string;
  borrowerId: string;
  amount: number;
  currency: string;
  duration: number;
  riskScore: number;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  requestDate: string;
}

export interface RiskCategory {
  name: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
}

export interface PoolDistribution {
  riskCategory: string;
  percentage: number;
  interestRate: number;
  maxLoanAmount: number;
}

export interface InvestmentPool {
  id: string;
  lenderId: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  distributions: PoolDistribution[];
  status: 'draft' | 'active' | 'funded' | 'closed';
  createdAt: string;
  expectedReturn: number;
  diversificationLevel: 'low' | 'medium' | 'high';
  autoInvest: boolean;
}

export interface PoolCreationState {
  step: 'setup' | 'funding' | 'distribution' | 'confirmation';
  totalAmount: number;
  name: string;
  hasSufficientFunds: boolean;
  distributions: PoolDistribution[];
  expectedReturn: number;
  autoInvest: boolean;
  diversificationLevel: 'low' | 'medium' | 'high';
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'loan' | 'payment' | 'pix';
  amount: number;
  currency: string;
  fromCurrency?: string;
  toCurrency?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  hash?: string;
  description: string;
  pixKey?: string;
  recipientName?: string;
  senderName?: string;
}

export interface PIXKey {
  id: string;
  type: 'phone' | 'email' | 'cpf' | 'random';
  value: string;
  isActive: boolean;
  createdAt: string;
}

export interface QRData {
  recipientName: string;
  recipientDocument?: string;
  amount: number;
  currency: string;
  pixKey: string;
  pixKeyType: 'phone' | 'email' | 'cpf' | 'random';
  description?: string;
  transactionId: string;
  bank?: string;
  city?: string;
}

export interface PortfolioLoan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerScore: number;
  amount: number;
  currency: string;
  interestRate: number;
  duration: number; // months
  startDate: string;
  nextPaymentDate: string;
  status: 'active' | 'late' | 'completed' | 'defaulted';
  paymentsReceived: number;
  totalPayments: number;
  monthlyPayment: number;
  totalInterestEarned: number;
  riskCategory: string;
  investmentPoolId?: string;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'late' | 'missed';
  lateFees?: number;
}

export interface PortfolioStats {
  totalInvested: number;
  totalReturns: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  averageROI: number;
  monthlyIncome: number;
  riskDistribution: {
    [key: string]: {
      amount: number;
      percentage: number;
      loans: number;
    };
  };
}

export interface PortfolioFilter {
  status: 'all' | 'active' | 'late' | 'completed' | 'defaulted';
  riskCategory: 'all' | string;
  sortBy: 'amount' | 'rate' | 'payment_date' | 'risk';
  sortOrder: 'asc' | 'desc';
}

interface AppContextType {
  user: User | null;
  currentScreen: string;
  theme: 'light' | 'dark' | 'auto';
  isLoading: boolean;
  loans: Loan[];
  creditRequests: CreditRequest[];
  investmentPools: InvestmentPool[];
  transactions: Transaction[];
  pixKeys: PIXKey[];
  qrData: QRData | null;
  poolCreation: PoolCreationState;
  riskCategories: RiskCategory[];
  portfolioLoans: PortfolioLoan[];
  portfolioStats: PortfolioStats;
  selectedPortfolioLoan: PortfolioLoan | null;
  setUser: (user: User | null) => void;
  setCurrentScreen: (screen: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setIsLoading: (loading: boolean) => void;
  addLoan: (loan: Loan) => void;
  addCreditRequest: (request: CreditRequest) => void;
  addInvestmentPool: (pool: InvestmentPool) => void;
  addTransaction: (transaction: Transaction) => void;
  addPIXKey: (key: PIXKey) => void;
  setQRData: (data: QRData | null) => void;
  updateLoanStatus: (loanId: string, status: Loan['status']) => void;
  updateCreditRequestStatus: (requestId: string, status: CreditRequest['status']) => void;
  updateUserBalance: (type: 'fiat' | 'stablecoin', amount: number) => void;
  updatePoolCreationState: (updates: Partial<PoolCreationState>) => void;
  resetPoolCreation: () => void;
  createPool: () => void;
  depositFunds: (amount: number) => void;
  addPortfolioLoan: (loan: PortfolioLoan) => void;
  updatePortfolioLoanStatus: (loanId: string, status: PortfolioLoan['status']) => void;
  addPaymentRecord: (loanId: string, payment: PaymentRecord) => void;
  setSelectedPortfolioLoan: (loan: PortfolioLoan | null) => void;
  getFilteredPortfolioLoans: (filter: PortfolioFilter) => PortfolioLoan[];
  calculatePortfolioStats: () => PortfolioStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize without user to show onboarding flow
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('splash'); // Start at splash screen for onboarding
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  
  const [poolCreation, setPoolCreation] = useState<PoolCreationState>({
    step: 'setup',
    totalAmount: 0,
    name: '',
    hasSufficientFunds: false,
    distributions: [],
    expectedReturn: 0,
    autoInvest: false,
    diversificationLevel: 'medium'
  });

  const riskCategories: RiskCategory[] = [
    {
      name: 'excellent',
      label: 'Excellent',
      minScore: 80,
      maxScore: 100,
      color: '#00C853',
      description: 'Great borrowers with excellent credit history'
    },
    {
      name: 'good',
      label: 'Good',
      minScore: 50,
      maxScore: 79,
      color: '#007AFF',
      description: 'Bad borrowers with moderate risk'
    },
    {
      name: 'poor',
      label: 'Poor',
      minScore: 30,
      maxScore: 49,
      color: '#FF9500',
      description: 'Horrible borrowers with high risk'
    },
    {
      name: 'terrible',
      label: 'Terrible',
      minScore: 0,
      maxScore: 29,
      color: '#FF3B30',
      description: 'Loser borrowers with very high risk'
    }
  ];

  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([
    {
      id: 'req_001',
      borrowerId: 'borrower_001',
      amount: 2500,
      currency: 'BRL',
      duration: 12,
      riskScore: 750,
      status: 'pending',
      documents: ['payslip', 'rg', 'cpf'],
      requestDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'req_002',
      borrowerId: 'borrower_002',
      amount: 5000,
      currency: 'BRL',
      duration: 18,
      riskScore: 680,
      status: 'pending',
      documents: ['payslip', 'rg'],
      requestDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'req_003',
      borrowerId: 'borrower_003',
      amount: 1500,
      currency: 'BRL',
      duration: 6,
      riskScore: 820,
      status: 'pending',
      documents: ['payslip', 'rg', 'cpf', 'bank_statement'],
      requestDate: new Date(Date.now() - 259200000).toISOString()
    }
  ]);
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_001',
      type: 'receive',
      amount: 1200,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      description: 'Loan disbursement'
    },
    {
      id: 'tx_002',
      type: 'pix',
      amount: 250,
      currency: 'BRL',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      description: 'PIX payment',
      pixKey: '+55 11 98888-8888',
      recipientName: 'João Silva'
    }
  ]);

  const [pixKeys, setPixKeys] = useState<PIXKey[]>([
    {
      id: 'key_001',
      type: 'phone',
      value: '+55 11 99999-9999',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ]);

  const [qrData, setQRData] = useState<QRData | null>(null);
  const [selectedPortfolioLoan, setSelectedPortfolioLoan] = useState<PortfolioLoan | null>(null);

  // Mock portfolio data for demo
  const [portfolioLoans, setPortfolioLoans] = useState<PortfolioLoan[]>([
    {
      id: 'loan_001',
      borrowerId: 'borrower_001',
      borrowerName: 'Carlos Santos',
      borrowerScore: 750,
      amount: 5000,
      currency: 'BRL',
      interestRate: 1.8,
      duration: 12,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      paymentsReceived: 3,
      totalPayments: 12,
      monthlyPayment: 447.12,
      totalInterestEarned: 341.44,
      riskCategory: 'excellent',
      paymentHistory: [
        {
          id: 'pay_001',
          loanId: 'loan_001',
          amount: 447.12,
          dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paidDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'paid'
        },
        {
          id: 'pay_002',
          loanId: 'loan_001',
          amount: 447.12,
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          paidDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'paid'
        },
        {
          id: 'pay_003',
          loanId: 'loan_001',
          amount: 447.12,
          dueDate: new Date().toISOString(),
          status: 'pending'
        }
      ]
    },
    {
      id: 'loan_002',
      borrowerId: 'borrower_002',
      borrowerName: 'Ana Oliveira',
      borrowerScore: 680,
      amount: 3000,
      currency: 'BRL',
      interestRate: 2.5,
      duration: 18,
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      paymentsReceived: 4,
      totalPayments: 18,
      monthlyPayment: 185.33,
      totalInterestEarned: 341.88,
      riskCategory: 'good',
      paymentHistory: []
    },
    {
      id: 'loan_003',
      borrowerId: 'borrower_003',
      borrowerName: 'Pedro Costa',
      borrowerScore: 820,
      amount: 8000,
      currency: 'BRL',
      interestRate: 1.5,
      duration: 24,
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      nextPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'late',
      paymentsReceived: 5,
      totalPayments: 24,
      monthlyPayment: 360.89,
      totalInterestEarned: 665.34,
      riskCategory: 'excellent',
      paymentHistory: []
    },
    {
      id: 'loan_004',
      borrowerId: 'borrower_004',
      borrowerName: 'Lucia Ferreira',
      borrowerScore: 450,
      amount: 1500,
      currency: 'BRL',
      interestRate: 4.2,
      duration: 6,
      startDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
      nextPaymentDate: '',
      status: 'completed',
      paymentsReceived: 6,
      totalPayments: 6,
      monthlyPayment: 275.45,
      totalInterestEarned: 152.70,
      riskCategory: 'poor',
      paymentHistory: []
    }
  ]);

  // Apply theme based on system preference and user setting
  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || 
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      document.documentElement.classList.toggle('dark', isDark);
    };

    applyTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const addLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
  };

  const addCreditRequest = (request: CreditRequest) => {
    setCreditRequests(prev => [...prev, request]);
  };

  const addInvestmentPool = (pool: InvestmentPool) => {
    setInvestmentPools(prev => [...prev, pool]);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const addPIXKey = (key: PIXKey) => {
    setPixKeys(prev => [...prev, key]);
  };

  const updateLoanStatus = (loanId: string, status: Loan['status']) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ));
  };

  const updateCreditRequestStatus = (requestId: string, status: CreditRequest['status']) => {
    setCreditRequests(prev => prev.map(request => 
      request.id === requestId ? { ...request, status } : request
    ));
  };

  const updateUserBalance = (type: 'fiat' | 'stablecoin', amount: number) => {
    if (user) {
      setUser({
        ...user,
        balances: {
          ...user.balances,
          [type]: user.balances[type] + amount
        }
      });
    }
  };

  const updatePoolCreationState = (updates: Partial<PoolCreationState>) => {
    setPoolCreation(prev => ({ ...prev, ...updates }));
  };

  const resetPoolCreation = () => {
    setPoolCreation({
      step: 'setup',
      totalAmount: 0,
      name: '',
      hasSufficientFunds: false,
      distributions: [],
      expectedReturn: 0,
      autoInvest: false,
      diversificationLevel: 'medium'
    });
  };

  const createPool = () => {
    const newPool: InvestmentPool = {
      id: `pool_${Date.now()}`,
      lenderId: user?.id || '',
      name: poolCreation.name,
      totalAmount: poolCreation.totalAmount,
      availableAmount: poolCreation.totalAmount,
      distributions: poolCreation.distributions,
      status: 'active',
      createdAt: new Date().toISOString(),
      expectedReturn: poolCreation.expectedReturn,
      diversificationLevel: poolCreation.diversificationLevel,
      autoInvest: poolCreation.autoInvest
    };

    addInvestmentPool(newPool);
    updateUserBalance('fiat', -poolCreation.totalAmount);
    
    // Add transaction record
    addTransaction({
      id: `tx_${Date.now()}`,
      type: 'send',
      amount: poolCreation.totalAmount,
      currency: 'BRL',
      date: new Date().toISOString(),
      status: 'completed',
      description: `Investment pool created: ${poolCreation.name}`
    });

    resetPoolCreation();
    setCurrentScreen('home');
  };

  const depositFunds = (amount: number) => {
    updateUserBalance('fiat', amount);
    
    // Add transaction record
    addTransaction({
      id: `tx_${Date.now()}`,
      type: 'receive',
      amount: amount,
      currency: 'BRL',
      date: new Date().toISOString(),
      status: 'completed',
      description: 'Funds deposited for pool creation'
    });
  };

  // Portfolio management functions
  const addPortfolioLoan = (loan: PortfolioLoan) => {
    setPortfolioLoans(prev => [...prev, loan]);
  };

  const updatePortfolioLoanStatus = (loanId: string, status: PortfolioLoan['status']) => {
    setPortfolioLoans(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ));
  };

  const addPaymentRecord = (loanId: string, payment: PaymentRecord) => {
    setPortfolioLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, paymentHistory: [...loan.paymentHistory, payment] }
        : loan
    ));
  };

  const getFilteredPortfolioLoans = (filter: PortfolioFilter): PortfolioLoan[] => {
    let filtered = portfolioLoans;

    if (filter.status !== 'all') {
      filtered = filtered.filter(loan => loan.status === filter.status);
    }

    if (filter.riskCategory !== 'all') {
      filtered = filtered.filter(loan => loan.riskCategory === filter.riskCategory);
    }

    // Sort loans
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filter.sortBy) {
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'rate':
          comparison = a.interestRate - b.interestRate;
          break;
        case 'payment_date':
          comparison = new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
          break;
        case 'risk':
          comparison = a.borrowerScore - b.borrowerScore;
          break;
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const calculatePortfolioStats = (): PortfolioStats => {
    const totalInvested = portfolioLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalReturns = portfolioLoans.reduce((sum, loan) => sum + loan.totalInterestEarned, 0);
    const activeLoans = portfolioLoans.filter(loan => loan.status === 'active').length;
    const completedLoans = portfolioLoans.filter(loan => loan.status === 'completed').length;
    const defaultedLoans = portfolioLoans.filter(loan => loan.status === 'defaulted').length;
    const averageROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
    const monthlyIncome = portfolioLoans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    // Calculate risk distribution
    const riskDistribution: { [key: string]: { amount: number; percentage: number; loans: number } } = {};
    
    portfolioLoans.forEach(loan => {
      if (!riskDistribution[loan.riskCategory]) {
        riskDistribution[loan.riskCategory] = { amount: 0, percentage: 0, loans: 0 };
      }
      riskDistribution[loan.riskCategory].amount += loan.amount;
      riskDistribution[loan.riskCategory].loans += 1;
    });

    Object.keys(riskDistribution).forEach(category => {
      riskDistribution[category].percentage = 
        totalInvested > 0 ? (riskDistribution[category].amount / totalInvested) * 100 : 0;
    });

    return {
      totalInvested,
      totalReturns,
      activeLoans,
      completedLoans,
      defaultedLoans,
      averageROI,
      monthlyIncome,
      riskDistribution
    };
  };

  const portfolioStats = calculatePortfolioStats();

  const value: AppContextType = {
    user,
    currentScreen,
    theme,
    isLoading,
    loans,
    creditRequests,
    investmentPools,
    transactions,
    pixKeys,
    qrData,
    poolCreation,
    riskCategories,
    portfolioLoans,
    portfolioStats,
    selectedPortfolioLoan,
    setUser,
    setCurrentScreen,
    setTheme,
    setIsLoading,
    addLoan,
    addCreditRequest,
    addInvestmentPool,
    addTransaction,
    addPIXKey,
    setQRData,
    updateLoanStatus,
    updateCreditRequestStatus,
    updateUserBalance,
    updatePoolCreationState,
    resetPoolCreation,
    createPool,
    depositFunds,
    addPortfolioLoan,
    updatePortfolioLoanStatus,
    addPaymentRecord,
    setSelectedPortfolioLoan,
    getFilteredPortfolioLoans,
    calculatePortfolioStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};