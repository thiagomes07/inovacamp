import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowUpDown, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  change24h: number;
}

interface SwapTransaction {
  id: string;
  from: string;
  to: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  hash?: string;
}

export const SwapScreen: React.FC = () => {
  const { user, setCurrentScreen, addTransaction, updateUserBalance } = useApp();
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [recentSwaps, setRecentSwaps] = useState<SwapTransaction[]>([]);
  const [metamaskConnected, setMetamaskConnected] = useState(false);

  const currencies = [
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', type: 'fiat' },
    { code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat' },
    { code: 'EUR', name: 'Euro', symbol: '€', type: 'fiat' },
    { code: 'USDC', name: 'USD Coin', symbol: 'USDC', type: 'crypto' },
    { code: 'USDT', name: 'Tether', symbol: 'USDT', type: 'crypto' },
    { code: 'BTC', name: 'Bitcoin', symbol: 'BTC', type: 'crypto' },
    { code: 'ETH', name: 'Ethereum', symbol: 'ETH', type: 'crypto' }
  ];

  // Mock exchange rates
  useEffect(() => {
    const mockRates: ExchangeRate[] = [
      { from: 'BRL', to: 'USDC', rate: 0.19, change24h: 2.3 },
      { from: 'USDC', to: 'BRL', rate: 5.25, change24h: -2.3 },
      { from: 'BRL', to: 'USD', rate: 0.18, change24h: 1.2 },
      { from: 'USD', to: 'BRL', rate: 5.45, change24h: -1.2 },
      { from: 'BRL', to: 'EUR', rate: 0.17, change24h: 0.8 },
      { from: 'EUR', to: 'BRL', rate: 5.89, change24h: -0.8 },
    ];
    setExchangeRates(mockRates);

    // Mock recent swaps
    setRecentSwaps([
      {
        id: '1',
        from: 'BRL',
        to: 'USDC',
        fromAmount: 1000,
        toAmount: 190,
        rate: 0.19,
        fee: 5,
        status: 'completed',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        hash: '0x1234...5678'
      },
      {
        id: '2',
        from: 'USDC',
        to: 'BRL',
        fromAmount: 100,
        toAmount: 525,
        rate: 5.25,
        fee: 2.5,
        status: 'completed',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        hash: '0xabcd...efgh'
      }
    ]);
  }, []);

  const getCurrentRate = () => {
    const rateInfo = exchangeRates.find(r => r.from === fromCurrency && r.to === toCurrency);
    return rateInfo || { from: fromCurrency, to: toCurrency, rate: 1, change24h: 0 };
  };

  const calculateExchange = (amount: string, isFromAmount: boolean) => {
    const rate = getCurrentRate().rate;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) return '';
    
    if (isFromAmount) {
      const converted = numAmount * rate;
      setToAmount(converted.toFixed(6));
    } else {
      const converted = numAmount / rate;
      setFromAmount(converted.toFixed(2));
    }
  };

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleConnectMetamask = async () => {
    try {
      setIsSwapping(true);
      // Simulate MetaMask connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMetamaskConnected(true);
      toast.success('MetaMask connected successfully!');
    } catch (error) {
      toast.error('Failed to connect MetaMask');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      toast.error('Please enter an amount to swap');
      return;
    }

    if (!metamaskConnected && (fromCurrency === 'USDC' || toCurrency === 'USDC')) {
      toast.error('Please connect MetaMask for crypto transactions');
      return;
    }

    const fromValue = parseFloat(fromAmount);
    if (fromCurrency === 'BRL' && fromValue > (user?.balances.fiat || 0)) {
      toast.error('Insufficient BRL balance');
      return;
    }

    setIsSwapping(true);

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      const swapId = Math.random().toString(36).substr(2, 9);
      const rate = getCurrentRate().rate;
      const fee = fromValue * 0.005; // 0.5% fee

      // Create swap transaction
      const newSwap: SwapTransaction = {
        id: swapId,
        from: fromCurrency,
        to: toCurrency,
        fromAmount: fromValue,
        toAmount: parseFloat(toAmount),
        rate,
        fee,
        status: 'completed',
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substr(2, 40)}`
      };

      setRecentSwaps(prev => [newSwap, ...prev]);

      // Update user balances
      if (fromCurrency === 'BRL') {
        updateUserBalance('fiat', -fromValue);
      }
      if (toCurrency === 'BRL') {
        updateUserBalance('fiat', parseFloat(toAmount));
      }
      if (fromCurrency === 'USDC') {
        updateUserBalance('stablecoin', -fromValue);
      }
      if (toCurrency === 'USDC') {
        updateUserBalance('stablecoin', parseFloat(toAmount));
      }

      // Add to transaction history
      addTransaction({
        id: swapId,
        type: 'swap',
        amount: fromValue,
        currency: fromCurrency,
        fromCurrency,
        toCurrency,
        date: new Date().toISOString(),
        status: 'completed',
        hash: newSwap.hash,
        description: `Swapped ${fromValue} ${fromCurrency} to ${parseFloat(toAmount).toFixed(2)} ${toCurrency}`
      });

      toast.success('Swap completed successfully!');
      setFromAmount('');
      setToAmount('');

    } catch (error) {
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const currentRate = getCurrentRate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#007AFF] to-[#00C853] px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl">Currency Swap</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Refresh rates
              setExchangeRates(prev => prev.map(rate => ({
                ...rate,
                rate: rate.rate * (0.98 + Math.random() * 0.04),
                change24h: (Math.random() - 0.5) * 10
              })));
              toast.success('Rates updated');
            }}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Rate Display */}
        <Card className="bg-white/15 backdrop-blur border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Current Rate</p>
              <p className="text-white text-lg">
                1 {fromCurrency} = {currentRate.rate.toFixed(6)} {toCurrency}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {currentRate.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#00C853]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${
                currentRate.change24h >= 0 ? 'text-[#00C853]' : 'text-red-400'
              }`}>
                {currentRate.change24h >= 0 ? '+' : ''}{currentRate.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* MetaMask Connection */}
        {!metamaskConnected && (
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-8 h-8 text-orange-500" />
                <div>
                  <h3 className="text-sm">Connect MetaMask</h3>
                  <p className="text-xs text-muted-foreground">
                    Required for crypto transactions
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectMetamask}
                disabled={isSwapping}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSwapping ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Swap Form */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            {/* From Currency */}
            <div className="space-y-2">
              <Label htmlFor="from-amount">From</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="from-amount"
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => {
                      setFromAmount(e.target.value);
                      calculateExchange(e.target.value, true);
                    }}
                    className="text-lg"
                  />
                </div>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.symbol}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: {
                  fromCurrency === 'BRL' ? `R$ ${user?.balances.fiat.toLocaleString() || 0}` :
                  fromCurrency === 'USDC' ? `${user?.balances.stablecoin.toLocaleString() || 0} USDC` :
                  '-- --'
                }</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-[#007AFF]"
                  onClick={() => {
                    if (fromCurrency === 'BRL' && user?.balances.fiat) {
                      setFromAmount(user.balances.fiat.toString());
                      calculateExchange(user.balances.fiat.toString(), true);
                    }
                  }}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapCurrencies}
                className="rounded-full w-10 h-10 p-0"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <Label htmlFor="to-amount">To</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="to-amount"
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => {
                      setToAmount(e.target.value);
                      calculateExchange(e.target.value, false);
                    }}
                    className="text-lg"
                  />
                </div>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.symbol}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && toAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-border pt-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>1 {fromCurrency} = {currentRate.rate.toFixed(6)} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{(parseFloat(fromAmount) * 0.005).toFixed(2)} {fromCurrency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You'll receive</span>
                <span className="text-[#00C853]">{toAmount} {toCurrency}</span>
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || isSwapping}
            className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-3"
          >
            {isSwapping ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Swap...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Swap {fromCurrency} to {toCurrency}</span>
              </div>
            )}
          </Button>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[#007AFF] mt-0.5" />
            <div>
              <h4 className="text-sm text-[#007AFF] mb-1">Secure Transactions</h4>
              <p className="text-xs text-muted-foreground">
                All swaps are secured by blockchain technology. Transactions are immutable and transparent.
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Swaps */}
        {recentSwaps.length > 0 && (
          <div>
            <h3 className="mb-4">Recent Swaps</h3>
            <div className="space-y-3">
              {recentSwaps.map((swap) => (
                <Card key={swap.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                        <ArrowUpDown className="w-5 h-5 text-[#007AFF]" />
                      </div>
                      <div>
                        <p className="text-sm">
                          {swap.fromAmount} {swap.from} → {swap.toAmount.toFixed(2)} {swap.to}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(swap.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className="bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]"
                      >
                        {swap.status}
                      </Badge>
                      {swap.hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs text-[#007AFF]"
                          onClick={() => {
                            navigator.clipboard.writeText(swap.hash!);
                            toast.success('Transaction hash copied');
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on Explorer
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};