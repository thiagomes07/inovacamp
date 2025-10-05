import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";

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
  type:
    | "deposit"
    | "withdraw"
    | "swap"
    | "loan_received"
    | "loan_payment"
    | "investment"
    | "return";
  amount: number;
  currency: keyof WalletBalance;
  date: string;
  status: "pending" | "completed" | "failed";
  description: string;
  hash?: string;
}

interface WalletContextType {
  balance: WalletBalance;
  availableBalance: WalletBalance;
  investedBalance: WalletBalance;
  transactions: WalletTransaction[];
  isLoading: boolean;
  deposit: (
    amount: number,
    currency: keyof WalletBalance,
    method: string
  ) => Promise<void>;
  withdraw: (
    amount: number,
    currency: keyof WalletBalance,
    method: string,
    destination: string
  ) => Promise<void>;
  swap: (
    fromCurrency: keyof WalletBalance,
    toCurrency: keyof WalletBalance,
    amount: number
  ) => Promise<void>;
  refreshBalance: () => Promise<void>;
  getTotalBalanceInBRL: () => number;
}

const USDC_TO_BRL_RATE = 5.15;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({
    brl: 0,
    usdc: 0,
    usdt: 0,
    dai: 0,
    btc: 0,
    eth: 0,
  });

  const [availableBalance, setAvailableBalance] = useState<WalletBalance>({
    brl: 0,
    usdc: 0,
    usdt: 0,
    dai: 0,
    btc: 0,
    eth: 0,
  });

  const [investedBalance, setInvestedBalance] = useState<WalletBalance>({
    brl: 0,
    usdc: 0,
    usdt: 0,
    dai: 0,
    btc: 0,
    eth: 0,
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar carteiras do backend
  const fetchWallets = async () => {
    if (!user) return;

    // Buscar userId do localStorage (funciona para user e investor)
    const swapinUser = localStorage.getItem("swapin_user");
    if (!swapinUser) return;

    const userData = JSON.parse(swapinUser);
    const userId = userData.id; // O transformApiUser já coloca user_id ou investor_id em "id"

    // Determinar owner_type baseado no profileType
    // Se profileType for "lender", é INVESTOR, caso contrário é USER
    const ownerType = userData.profileType === "lender" ? "INVESTOR" : "USER";

    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/wallet/${ownerType}/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const wallets = await response.json();

      // Processar wallets e consolidar por moeda
      const newBalance: WalletBalance = {
        brl: 0,
        usdc: 0,
        usdt: 0,
        dai: 0,
        btc: 0,
        eth: 0,
      };

      wallets.forEach((wallet: any) => {
        const currency = wallet.currency.toLowerCase() as keyof WalletBalance;
        if (currency in newBalance) {
          newBalance[currency] += wallet.balance || 0;
        }
      });

      setBalance(newBalance);
      setAvailableBalance(newBalance); // Por enquanto, disponível = total

      console.log("[useWallet] Carteiras carregadas:", wallets);
      console.log("[useWallet] Saldo consolidado:", newBalance);
    } catch (err) {
      console.error("Erro ao buscar carteiras:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar transações do backend
  const fetchTransactions = async () => {
    if (!user) return;

    const swapinUser = localStorage.getItem("swapin_user");
    if (!swapinUser) return;

    const userData = JSON.parse(swapinUser);
    const userId = userData.id;

    if (!userId) return;

    try {
      // Buscar as primeiras carteiras para pegar wallet_id
      const ownerType = userData.profileType === "lender" ? "INVESTOR" : "USER";
      const walletsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/wallet/${ownerType}/${userId}`
      );

      if (!walletsResponse.ok) return;

      const wallets = await walletsResponse.json();
      if (wallets.length === 0) return;

      // Buscar transações da primeira carteira (BRL)
      const brlWallet = wallets.find(
        (w: any) => w.currency.toLowerCase() === "brl"
      );
      if (!brlWallet) return;

      const txResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/transaction/wallet/${
          brlWallet.wallet_id
        }`
      );

      if (!txResponse.ok) return;

      const txData = await txResponse.json();

      // Converter formato do backend para o esperado pelo frontend
      const formattedTransactions: WalletTransaction[] = txData.map(
        (tx: any) => ({
          id: tx.transaction_id,
          type: tx.transaction_type.toLowerCase() as any,
          amount: tx.amount,
          currency: tx.currency?.toLowerCase() || "brl",
          date: tx.created_at,
          status: tx.status.toLowerCase() as any,
          description: tx.description || "Transação",
          hash: tx.blockchain_hash,
        })
      );

      setTransactions(formattedTransactions);
      console.log("[useWallet] Transações carregadas:", formattedTransactions);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
    }
  };

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchTransactions();
    }
  }, [user]);

  const deposit = async (
    amount: number,
    currency: keyof WalletBalance,
    method: string
  ) => {
    setIsLoading(true);

    // TODO: POST /api/wallet/deposit
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "deposit",
      amount,
      currency,
      date: new Date().toISOString(),
      status: "completed",
      description: `Depósito via ${method}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setBalance((prev) => ({
      ...prev,
      [currency]: prev[currency] + amount,
    }));
    setAvailableBalance((prev) => ({
      ...prev,
      [currency]: prev[currency] + amount,
    }));

    setIsLoading(false);
  };

  const withdraw = async (
    amount: number,
    currency: keyof WalletBalance,
    method: string,
    destination: string
  ) => {
    setIsLoading(true);

    // TODO: POST /api/wallet/withdraw
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "withdraw",
      amount,
      currency,
      date: new Date().toISOString(),
      status: "completed",
      description: `Envio via ${method}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setBalance((prev) => ({
      ...prev,
      [currency]: prev[currency] - amount,
    }));
    setAvailableBalance((prev) => ({
      ...prev,
      [currency]: prev[currency] - amount,
    }));

    setIsLoading(false);
  };

  const swap = async (
    fromCurrency: keyof WalletBalance,
    toCurrency: keyof WalletBalance,
    amount: number
  ) => {
    setIsLoading(true);

    // TODO: POST /api/wallet/swap
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock exchange rates
    const rates: Record<string, number> = {
      "brl-usdc": 0.2,
      "usdc-brl": 5.015,
      "brl-usdt": 0.2,
      "usdt-brl": 5.0,
    };

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = rates[rateKey] || 1;
    const receivedAmount = amount * rate;

    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "swap",
      amount: receivedAmount,
      currency: toCurrency,
      date: new Date().toISOString(),
      status: "completed",
      description: `Conversão ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()}`,
      hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random()
        .toString(16)
        .substr(2, 4)}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setBalance((prev) => ({
      ...prev,
      [fromCurrency]: prev[fromCurrency] - amount,
      [toCurrency]: prev[toCurrency] + receivedAmount,
    }));
    setAvailableBalance((prev) => ({
      ...prev,
      [fromCurrency]: prev[fromCurrency] - amount,
      [toCurrency]: prev[toCurrency] + receivedAmount,
    }));

    setIsLoading(false);
  };

  const refreshBalance = async () => {
    await fetchWallets();
    await fetchTransactions();
  };

  const getTotalBalanceInBRL = (): number => {
    return balance.brl + balance.usdc * USDC_TO_BRL_RATE;
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        availableBalance,
        investedBalance,
        transactions,
        isLoading,
        deposit,
        withdraw,
        swap,
        refreshBalance,
        getTotalBalanceInBRL,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
