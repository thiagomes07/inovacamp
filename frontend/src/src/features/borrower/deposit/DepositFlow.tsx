import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, QrCode, Building, FileText, Smartphone } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { PixDeposit } from './PixDeposit';
import { BankTransferDeposit } from './BankTransferDeposit';
import { BoletoDeposit } from './BoletoDeposit';
import { CreditCardDeposit } from './CreditCardDeposit';

type DepositMethod = 'select' | 'pix' | 'bank-transfer' | 'boleto' | 'credit-card';

interface DepositFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

const depositMethods = [
  {
    id: 'pix' as const,
    title: 'PIX',
    subtitle: 'Transferência instantânea',
    icon: Smartphone,
    description: 'Depósito instantâneo via PIX',
    recommended: true
  },
  {
    id: 'bank-transfer' as const,
    title: 'TED/DOC',
    subtitle: 'Transferência bancária',
    icon: Building,
    description: 'Transferência tradicional via TED ou DOC'
  },
  {
    id: 'boleto' as const,
    title: 'Boleto',
    subtitle: 'Pagamento por boleto',
    icon: FileText,
    description: 'Gere um boleto para pagamento'
  },
  {
    id: 'credit-card' as const,
    title: 'Cartão de Crédito',
    subtitle: 'Pagamento com cartão',
    icon: CreditCard,
    description: 'Deposite usando seu cartão de crédito'
  }
];

export const DepositFlow: React.FC<DepositFlowProps> = ({ onBack, onComplete }) => {
  const [currentMethod, setCurrentMethod] = useState<DepositMethod>('select');

  const handleMethodSelect = (method: DepositMethod) => {
    setCurrentMethod(method);
  };

  const handleBackToMethods = () => {
    setCurrentMethod('select');
  };

  const renderMethodSelection = () => (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Receber</h1>
        </div>
        <p className="text-gray-300">Escolha como deseja receber dinheiro na sua conta</p>
      </div>

      {/* Methods Grid */}
      <div className="space-y-4">
        {depositMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="relative backdrop-blur-md bg-white/10 border-white/20 p-6 cursor-pointer transition-all hover:bg-white/15"
                onClick={() => handleMethodSelect(method.id)}
              >
                {method.recommended && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recomendado
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{method.title}</h3>
                    <p className="text-gray-300 text-sm mb-1">{method.subtitle}</p>
                    <p className="text-gray-400 text-xs">{method.description}</p>
                  </div>
                  
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="backdrop-blur-md bg-blue-500/10 border-blue-500/20 p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-400 font-semibold text-sm">i</span>
          </div>
          <div>
            <p className="text-blue-300 font-medium mb-1">Depósitos seguros</p>
            <p className="text-blue-200 text-sm">
              Todos os depósitos são processados com segurança máxima e confirmados automaticamente.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMethodComponent = () => {
    const commonProps = {
      onBack: handleBackToMethods,
      onComplete
    };

    switch (currentMethod) {
      case 'pix':
        return <PixDeposit {...commonProps} />;
      case 'bank-transfer':
        return <BankTransferDeposit {...commonProps} />;
      case 'boleto':
        return <BoletoDeposit {...commonProps} />;
      case 'credit-card':
        return <CreditCardDeposit {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMethod}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentMethod === 'select' ? renderMethodSelection() : renderMethodComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};