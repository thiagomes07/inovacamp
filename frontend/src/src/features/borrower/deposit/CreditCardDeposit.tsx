import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Lock, DollarSign, Shield } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';

interface CreditCardDepositProps {
  onBack: () => void;
  onComplete: () => void;
}

type CardStep = 'amount' | 'card-details' | 'processing';

export const CreditCardDeposit: React.FC<CreditCardDepositProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<CardStep>('amount');
  const [amount, setAmount] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });
  const [processing, setProcessing] = useState(false);

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    setCurrentStep('card-details');
  };

  const handleCardSubmit = () => {
    // Validation
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      toast.error('Número do cartão inválido');
      return;
    }
    if (!cardData.holder.trim()) {
      toast.error('Nome do portador é obrigatório');
      return;
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      toast.error('Data de validade inválida');
      return;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      toast.error('CVV inválido');
      return;
    }

    setCurrentStep('processing');
    setProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
      toast.success(`Depósito de R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} processado com sucesso!`);
      onComplete();
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardBrand = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    return 'Cartão';
  };

  const numericAmount = amount ? parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) : 0;

  const renderAmountStep = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Cartão de Crédito</h1>
          <p className="text-gray-300">Digite o valor que deseja receber</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Qual valor deseja receber?</h2>
          <p className="text-gray-300">O valor será processado instantaneamente</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">Valor do depósito</label>
            <MaskedInput
              mask="currency"
              placeholder="R$ 0,00"
              value={amount}
              onChange={setAmount}
              className="text-lg h-14"
            />
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-3 gap-3">
            {['200', '500', '1000'].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => setAmount(`R$ ${quickAmount},00`)}
                className="border-gray-600 text-gray-300 hover:bg-purple-600/10 hover:border-purple-600"
              >
                R$ {quickAmount}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleAmountNext}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3"
            disabled={!amount}
          >
            Continuar
          </Button>
        </div>

        {/* Info about fees */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-400 font-semibold text-sm">%</span>
            </div>
            <div>
              <p className="text-yellow-300 font-medium mb-1">Taxa de processamento</p>
              <p className="text-yellow-200 text-sm">
                Cartão de crédito tem taxa de 3,5% + R$ 0,30 por transação.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCardDetailsStep = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => setCurrentStep('amount')}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Dados do Cartão</h1>
          <p className="text-gray-300">Preencha as informações do seu cartão</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        {/* Amount display */}
        <div className="text-center border-b border-gray-600 pb-4">
          <p className="text-gray-300 mb-1">Valor do depósito</p>
          <p className="text-3xl font-bold text-purple-400">
            R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            + Taxa: R$ {(numericAmount * 0.035 + 0.30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card form */}
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="text-white font-medium mb-2 block">Número do cartão</label>
            <div className="relative">
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                className="pl-12"
                maxLength={19}
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              {cardData.number.length > 0 && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {getCardBrand(cardData.number)}
                </span>
              )}
            </div>
          </div>

          {/* Card Holder */}
          <div>
            <label className="text-white font-medium mb-2 block">Nome no cartão</label>
            <Input
              placeholder="Nome como está no cartão"
              value={cardData.holder}
              onChange={(e) => setCardData(prev => ({ ...prev, holder: e.target.value.toUpperCase() }))}
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white font-medium mb-2 block">Validade</label>
              <Input
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                maxLength={5}
              />
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">CVV</label>
              <div className="relative">
                <Input
                  placeholder="000"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                  className="pr-10"
                  maxLength={4}
                  type="password"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <Button
            onClick={handleCardSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3"
          >
            Confirmar pagamento
          </Button>
        </div>

        {/* Security info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <p className="text-green-300 font-medium">Transação segura</p>
          </div>
          <p className="text-green-200 text-sm">
            Seus dados são criptografados e protegidos por SSL de 256 bits.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="p-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
            {processing ? (
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CreditCard className="w-8 h-8 text-purple-400" />
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            {processing ? 'Processando pagamento...' : 'Pagamento processado!'}
          </h2>
          
          <p className="text-gray-300 mb-6">
            {processing 
              ? 'Aguarde enquanto validamos as informações do cartão'
              : 'Seu depósito foi processado com sucesso!'
            }
          </p>

          {processing && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full w-2/3 animate-pulse"></div>
              </div>
              <p className="text-gray-400 text-sm">Validando dados do cartão...</p>
            </div>
          )}
        </div>

        {/* Transaction details */}
        <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-medium">Detalhes da transação:</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Valor:</span>
              <span className="text-white">R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taxa:</span>
              <span className="text-white">R$ {(numericAmount * 0.035 + 0.30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-2">
              <span className="text-gray-400 font-medium">Total:</span>
              <span className="text-white font-medium">R$ {(numericAmount + numericAmount * 0.035 + 0.30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cartão:</span>
              <span className="text-white">**** {cardData.number.slice(-4)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {currentStep === 'amount' && renderAmountStep()}
      {currentStep === 'card-details' && renderCardDetailsStep()}
      {currentStep === 'processing' && renderProcessingStep()}
    </motion.div>
  );
};