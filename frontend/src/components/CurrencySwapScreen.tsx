import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  ArrowUpDown,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  balance: number;
  rate: number;
  color: string;
  type: 'fiat' | 'crypto';
  icon: string;
}

export const CurrencySwapScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();

  const currencies: Currency[] = [
    {
      code: 'BRL',
      name: 'Real Brasileiro',
      symbol: 'R$',
      balance: 2500.00,
      rate: 1,
      color: '#059669',
      type: 'fiat',
      icon: '🇧🇷'
    },
    {
      code: 'USDT',
      name: 'Tether USD',
      symbol: '₮',
      balance: 1000.00,
      rate: 5.2,
      color: '#26A17B',
      type: 'crypto',
      icon: '₮'
    },
    {
      code: 'USDC',
      name: 'USD Coin',
      symbol: '$',
      balance: user?.balances.stablecoin || 0,
      rate: 5.2,
      color: '#2775CA',
      type: 'crypto',
      icon: 'Ⓤ'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      balance: 450.00,
      rate: 5.8,
      color: '#1E40AF',
      type: 'fiat',
      icon: '🇪🇺'
    }
  ];

  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const calculateToAmount = () => {
    if (!fromAmount) return '0';
    const amount = parseFloat(fromAmount);
    const converted = (amount / fromCurrency.rate) * toCurrency.rate;
    return converted.toFixed(2);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setFromAmount(calculateToAmount());
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (parseFloat(fromAmount) > fromCurrency.balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsSwapping(true);
    
    // Simulate swap process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Troca realizada com sucesso! ${fromAmount} ${fromCurrency.code} → ${calculateToAmount()} ${toCurrency.code}`);
    setIsSwapping(false);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen swapin-gradient">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setCurrentScreen('home')}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-white text-xl font-semibold">Trocar Moedas</h1>
            <p className="text-white/60 text-sm">Taxa em tempo real</p>
          </div>
          
          <div className="w-10" />
        </div>

        {/* Live Rate Banner */}
        <div className="swapin-glass p-4 rounded-2xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm">Taxa ao vivo</span>
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">1 USD = 5.20 BRL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Interface */}
      <div className="px-6 space-y-4">
        {/* From Currency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="swapin-glass p-6 border-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm">De</span>
              <span className="text-white/60 text-xs">
                Saldo: {fromCurrency.balance.toLocaleString()} {fromCurrency.code}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {/* Open currency selector */}}
                className="flex items-center space-x-3 bg-white/10 rounded-2xl p-3 hover:bg-white/20 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: fromCurrency.color }}
                >
                  {fromCurrency.icon}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{fromCurrency.code}</p>
                  <p className="text-white/60 text-xs">{fromCurrency.name}</p>
                </div>
              </button>
              
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-transparent border-0 text-white text-2xl font-bold text-right placeholder-white/30 p-0 h-auto"
                />
              </div>
            </div>
            
            <Button
              onClick={() => setFromAmount(fromCurrency.balance.toString())}
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 mt-2 ml-auto block text-xs"
            >
              Usar máximo
            </Button>
          </Card>
        </motion.div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={swapCurrencies}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpDown className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* To Currency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="swapin-glass p-6 border-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm">Para</span>
              <span className="text-white/60 text-xs">
                Saldo: {toCurrency.balance.toLocaleString()} {toCurrency.code}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {/* Open currency selector */}}
                className="flex items-center space-x-3 bg-white/10 rounded-2xl p-3 hover:bg-white/20 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: toCurrency.color }}
                >
                  {toCurrency.icon}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{toCurrency.code}</p>
                  <p className="text-white/60 text-xs">{toCurrency.name}</p>
                </div>
              </button>
              
              <div className="flex-1">
                <div className="text-white text-2xl font-bold text-right">
                  {calculateToAmount()}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Card className="swapin-glass p-4 border-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>Tempo estimado</span>
              </div>
              <span className="text-white">Instantâneo</span>
            </div>
          </Card>

          <Card className="swapin-glass p-4 border-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-white/70">
                <Zap className="w-4 h-4" />
                <span>Taxa de troca</span>
              </div>
              <span className="text-white">0.1%</span>
            </div>
          </Card>

          <Card className="swapin-glass p-4 border-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-white/70">
                <Shield className="w-4 h-4" />
                <span>Rede</span>
              </div>
              <span className="text-white">Swapin Network</span>
            </div>
          </Card>
        </motion.div>

        {/* Swap Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-6 pb-8"
        >
          <Button
            onClick={handleSwap}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
          >
            {isSwapping ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              `Trocar ${fromAmount || '0'} ${fromCurrency.code}`
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};