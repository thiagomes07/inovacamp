import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Zap,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface DepositMethod {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  fees: string;
  time: string;
  limits: string;
  currencies: string[];
  popular?: boolean;
}

export const MultiCurrencyDepositScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');

  const currencies = [
    { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷', color: '#059669' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', color: '#2775CA' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', color: '#1E40AF' },
    { code: 'USDT', name: 'Tether USD', flag: '₮', color: '#26A17B' },
    { code: 'USDC', name: 'USD Coin', flag: 'Ⓤ', color: '#2775CA' }
  ];

  const depositMethods: DepositMethod[] = [
    {
      id: 'open-finance',
      title: 'Open Finance',
      subtitle: 'Conecte sua conta bancária',
      description: 'Transferência instantânea de qualquer banco brasileiro',
      icon: Building2,
      badge: 'Recomendado',
      badgeColor: '#00C853',
      fees: 'Grátis',
      time: 'Instantâneo',
      limits: 'Até R$ 50.000/dia',
      currencies: ['BRL'],
      popular: true
    },
    {
      id: 'international-wire',
      title: 'Transferência Internacional',
      subtitle: 'SWIFT / Wire Transfer',
      description: 'Receba dinheiro de bancos internacionais',
      icon: Globe,
      badge: 'Global',
      badgeColor: '#007AFF',
      fees: 'R$ 25',
      time: '1-3 dias úteis',
      limits: 'Até $100.000/dia',
      currencies: ['USD', 'EUR']
    },
    {
      id: 'crypto-deposit',
      title: 'Depósito Cripto',
      subtitle: 'Blockchain Network',
      description: 'Transfira stablecoins diretamente para sua carteira',
      icon: Shield,
      badge: 'Crypto',
      badgeColor: '#8B5CF6',
      fees: 'Taxa de rede',
      time: '5-30 min',
      limits: 'Sem limite',
      currencies: ['USDT', 'USDC']
    },
    {
      id: 'pix',
      title: 'PIX',
      subtitle: 'Pagamento instantâneo',
      description: 'Transfira usando chave PIX ou QR code',
      icon: Zap,
      badge: 'Popular',
      badgeColor: '#FFD700',
      fees: 'Grátis',
      time: 'Instantâneo',
      limits: 'Até R$ 20.000/dia',
      currencies: ['BRL']
    },
    {
      id: 'card',
      title: 'Cartão de Crédito/Débito',
      subtitle: 'Visa, Mastercard',
      description: 'Use seu cartão internacional',
      icon: CreditCard,
      fees: '2.9%',
      time: 'Instantâneo',
      limits: 'Até $5.000/dia',
      currencies: ['USD', 'EUR', 'BRL']
    }
  ];

  const getAvailableMethods = () => {
    return depositMethods.filter(method => 
      method.currencies.includes(selectedCurrency)
    );
  };

  const handleMethodSelect = (methodId: string) => {
    switch (methodId) {
      case 'open-finance':
        setCurrentScreen('open-finance');
        break;
      case 'pix':
        setCurrentScreen('pix');
        break;
      case 'crypto-deposit':
        toast.success('Função de depósito cripto em desenvolvimento');
        break;
      case 'international-wire':
        toast.success('Função de transferência internacional em desenvolvimento');
        break;
      case 'card':
        toast.success('Função de cartão em desenvolvimento');
        break;
      default:
        toast.info('Método de depósito selecionado');
    }
  };

  return (
    <div className="min-h-screen swapin-gradient">
      {/* Header */}
      <div className="px-6 pt-16 pb-6">
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
            <h1 className="text-white text-xl font-semibold">Depositar</h1>
            <p className="text-white/60 text-sm">Escolha como adicionar fundos</p>
          </div>
          
          <div className="w-10" />
        </div>

        {/* Currency Selector */}
        <Card className="swapin-glass p-4 border-0 mb-6">
          <p className="text-white/70 text-sm mb-3">Selecione a moeda</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {currencies.map((currency) => (
              <motion.button
                key={currency.code}
                onClick={() => setSelectedCurrency(currency.code)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedCurrency === currency.code
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: selectedCurrency === currency.code ? currency.color : undefined
                }}
              >
                <span className="text-lg">{currency.flag}</span>
                <span className="font-medium">{currency.code}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </div>

      {/* Deposit Methods */}
      <div className="px-6 space-y-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">
            Métodos disponíveis para {selectedCurrency}
          </h2>
          <span className="text-white/60 text-sm">
            {getAvailableMethods().length} opções
          </span>
        </div>

        {getAvailableMethods().map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="swapin-glass p-6 border-0 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleMethodSelect(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold">{method.title}</h3>
                      {method.badge && (
                        <Badge 
                          className="text-xs px-2 py-0.5 text-white"
                          style={{ backgroundColor: method.badgeColor }}
                        >
                          {method.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-white/60 text-sm mb-2">{method.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-white/50">
                        <span>Taxa:</span>
                        <span className="text-white/80">{method.fees}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-white/50">
                        <Clock className="w-3 h-3" />
                        <span className="text-white/80">{method.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-white/40" />
              </div>

              {/* Limits */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Limite diário:</span>
                  <span className="text-white/80">{method.limits}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="swapin-glass p-4 border-0">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm mb-1">
                  Segurança Swapin
                </h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Todos os depósitos são protegidos por criptografia de ponta e 
                  monitoramento 24/7. Seus fundos ficam seguros em contas segregadas.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};