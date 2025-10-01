import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  X,
  Building2,
  CreditCard,
  Smartphone,
  Zap,
  Clock,
  Shield,
  TrendingUp
} from 'lucide-react';

interface InvestorDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestorDepositModal: React.FC<InvestorDepositModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentScreen } = useApp();

  const depositMethods = [
    {
      id: 'open-banking',
      icon: Building2,
      title: 'Open Finance',
      description: 'Conecte sua conta bancária',
      time: 'Instantâneo',
      fee: 'Gratuito',
      popular: true,
      action: () => {
        setCurrentScreen('open-finance');
        onClose();
      }
    },
    {
      id: 'pix',
      icon: Smartphone,
      title: 'PIX',
      description: 'Transferência instantânea',
      time: 'Instantâneo',
      fee: 'Gratuito',
      action: () => {
        setCurrentScreen('wallet-deposit');
        onClose();
      }
    },
    {
      id: 'bank-transfer',
      icon: CreditCard,
      title: 'TED/DOC',
      description: 'Transferência bancária tradicional',
      time: 'Até 1 dia útil',
      fee: 'R$ 0,00',
      action: () => {
        setCurrentScreen('wallet-deposit');
        onClose();
      }
    },
    {
      id: 'crypto',
      icon: TrendingUp,
      title: 'Crypto Deposit',
      description: 'USDT, USDC, BTC',
      time: '10-30 min',
      fee: 'Taxa de rede',
      action: () => {
        setCurrentScreen('deposit');
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-t-3xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Depositar Fundos</h2>
            <p className="text-white/60 text-sm">Escolha como adicionar dinheiro</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {depositMethods.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={method.action}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all relative"
            >
              {method.popular && (
                <div className="absolute -top-2 right-4">
                  <Badge className="bg-emerald-500 text-white text-xs">
                    Mais usado
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-medium">{method.title}</h3>
                    <p className="text-white/60 text-sm">{method.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock className="w-3 h-3 text-white/60" />
                    <p className="text-white/80 text-xs">{method.time}</p>
                  </div>
                  <Badge className={`text-xs ${
                    method.fee === 'Gratuito' || method.fee === 'R$ 0,00'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {method.fee}
                  </Badge>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-400 text-sm font-medium">Segurança garantida</p>
              <p className="text-emerald-300/80 text-xs">Todos os depósitos são protegidos por criptografia de ponta</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};