import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface WalletBalance {
  brl: number;
  usdc: number;
  usdt: number;
  dai: number;
  btc: number;
  eth: number;
}

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'loan_received' | 'loan_payment' | 'investment' | 'return';
  amount: number;
  currency: keyof WalletBalance;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  hash?: string;
}

interface WalletContextType {
  balance: WalletBalance;
  availableBalance: WalletBalance;
  investedBalance: WalletBalance;
  transactions: WalletTransaction[];
  isLoading: boolean;
  deposit: (amount: number, currency: keyof WalletBalance, method: string) => Promise<void>;
  withdraw: (amount: number, currency: keyof WalletBalance, method: string, destination: string) => Promise<void>;
  swap: (fromCurrency: keyof WalletBalance, toCurrency: keyof WalletBalance, amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({
    brl: 25450.00,
    usdc: 2100.50,
    usdt: 0,
    dai: 0,
    btc: 0.001,
    eth: 0.05
  });
  
  const [availableBalance, setAvailableBalance] = useState<WalletBalance>({
    brl: 25450.00,
    usdc: 2100.50,
    usdt: 0,
    dai: 0,
    btc: 0.001,
    eth: 0.05
  });

  const [investedBalance, setInvestedBalance] = useState<WalletBalance>({
    brl: 0,
    usdc: 8420.00,
    usdt: 0,
    dai: 0,
    btc: 0,
    eth: 0
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 1000.00,
      currency: 'brl',
      date: '2024-10-01T10:00:00Z',
      status: 'completed',
      description: 'Depósito via PIX'
    },
    {
      id: '2',
      type: 'loan_received',
      amount: 5000.00,
      currency: 'brl',
      date: '2024-10-01T14:30:00Z',
      status: 'completed',
      description: 'Empréstimo aprovado - Pool Diversificação'
    },
    {
      id: '3',
      type: 'swap',
      amount: 500.00,
      currency: 'usdc',
      date: '2024-10-02T09:15:00Z',
      status: 'completed',
      description: 'Conversão BRL → USDC',
      hash: '0x1234...5678'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const deposit = async (amount: number, currency: keyof WalletBalance, method: string) => {
    setIsLoading(true);
    
    // TODO: POST /api/wallet/deposit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      amount,
      currency,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Depósito via ${method}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => ({
      ...prev,
      [currency]: prev[currency] + amount
    }));
    setAvailableBalance(prev => ({
      ...prev,
      [currency]: prev[currency] + amount
    }));
    
    setIsLoading(false);
  };

  const withdraw = async (amount: number, currency: keyof WalletBalance, method: string, destination: string) => {
    setIsLoading(true);
    
    // TODO: POST /api/wallet/withdraw
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'withdraw',
      amount,
      currency,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Envio via ${method}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => ({
      ...prev,
      [currency]: prev[currency] - amount
    }));
    setAvailableBalance(prev => ({
      ...prev,
      [currency]: prev[currency] - amount
    }));
    
    setIsLoading(false);
  };

  const swap = async (fromCurrency: keyof WalletBalance, toCurrency: keyof WalletBalance, amount: number) => {
    setIsLoading(true);
    
    // TODO: POST /api/wallet/swap
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock exchange rates
    const rates: Record<string, number> = {
      'brl-usdc': 0.20,
      'usdc-brl': 5.015,
      'brl-usdt': 0.20,
      'usdt-brl': 5.00
    };
    
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = rates[rateKey] || 1;
    const receivedAmount = amount * rate;
    
    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'swap',
      amount: receivedAmount,
      currency: toCurrency,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Conversão ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()}`,
      hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => ({
      ...prev,
      [fromCurrency]: prev[fromCurrency] - amount,
      [toCurrency]: prev[toCurrency] + receivedAmount
    }));
    setAvailableBalance(prev => ({
      ...prev,
      [fromCurrency]: prev[fromCurrency] - amount,
      [toCurrency]: prev[toCurrency] + receivedAmount
    }));
    
    setIsLoading(false);
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    // TODO: GET /api/wallet/balance
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <WalletContext.Provider value={{
      balance,
      availableBalance,
      investedBalance,
      transactions,
      isLoading,
      deposit,
      withdraw,
      swap,
      refreshBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
};