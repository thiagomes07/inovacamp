import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Building, Copy, Check, DollarSign } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';

interface BankTransferDepositProps {
  onBack: () => void;
  onComplete: () => void;
}

type BankStep = 'amount' | 'bank-details';

export const BankTransferDeposit: React.FC<BankTransferDepositProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<BankStep>('amount');
  const [amount, setAmount] = useState('');
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    setCurrentStep('bank-details');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFields(prev => ({ ...prev, [field]: true }));
    toast.success(`${field} copiado!`);
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const handleComplete = () => {
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    toast.success(`Depósito de R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} confirmado!`);
    onComplete();
  };

  const numericAmount = amount ? parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) : 0;

  // Mock bank details
  const bankDetails = {
    bank: 'Banco do Brasil',
    bankCode: '001',
    agency: '1234-5',
    account: '12345678-9',
    accountType: 'Conta Corrente',
    holder: 'Swapin Fintech Ltda',
    cnpj: '12.345.678/0001-90'
  };

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
          <h1 className="text-2xl font-bold text-white">Transferência Bancária</h1>
          <p className="text-gray-300">Digite o valor que deseja receber</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Qual valor deseja receber?</h2>
          <p className="text-gray-300">A transferência será processada em até 1 dia útil</p>
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
            {['1000', '5000', '10000'].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => setAmount(`R$ ${quickAmount},00`)}
                className="border-gray-600 text-gray-300 hover:bg-blue-600/10 hover:border-blue-600"
              >
                R$ {quickAmount}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleAmountNext}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3"
            disabled={!amount}
          >
            Ver dados bancários
          </Button>
        </div>

        {/* Info about processing time */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-400 font-semibold text-sm">!</span>
            </div>
            <div>
              <p className="text-yellow-300 font-medium mb-1">Tempo de processamento</p>
              <p className="text-yellow-200 text-sm">
                TED/DOC podem levar até 1 dia útil para serem processadas.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBankDetailsStep = () => (
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
          <h1 className="text-2xl font-bold text-white">Dados Bancários</h1>
          <p className="text-gray-300">Use estes dados para fazer a transferência</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        {/* Amount display */}
        <div className="text-center border-b border-gray-600 pb-4">
          <p className="text-gray-300 mb-1">Valor do depósito</p>
          <p className="text-3xl font-bold text-blue-400">
            R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          {/* Bank */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Banco:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-white">
                {bankDetails.bank} ({bankDetails.bankCode})
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(`${bankDetails.bank} (${bankDetails.bankCode})`, 'Banco')}
                className={`${copiedFields.Banco ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} transition-colors`}
              >
                {copiedFields.Banco ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Agency */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Agência:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-white font-mono">
                {bankDetails.agency}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.agency, 'Agência')}
                className={`${copiedFields.Agência ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} transition-colors`}
              >
                {copiedFields.Agência ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Conta:</span>
              <span className="text-blue-400 text-sm">{bankDetails.accountType}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-white font-mono">
                {bankDetails.account}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.account, 'Conta')}
                className={`${copiedFields.Conta ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} transition-colors`}
              >
                {copiedFields.Conta ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Holder */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Favorecido:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-white">
                {bankDetails.holder}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.holder, 'Favorecido')}
                className={`${copiedFields.Favorecido ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} transition-colors`}
              >
                {copiedFields.Favorecido ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* CNPJ */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">CNPJ:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-white font-mono">
                {bankDetails.cnpj}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.cnpj, 'CNPJ')}
                className={`${copiedFields.CNPJ ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} transition-colors`}
              >
                {copiedFields.CNPJ ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <h3 className="text-blue-300 font-medium mb-2">Instruções importantes:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Use exatamente o valor informado</li>
            <li>• Confira todos os dados antes de confirmar</li>
            <li>• A transferência pode levar até 1 dia útil</li>
            <li>• Guarde o comprovante da transferência</li>
          </ul>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
        >
          Já fiz a transferência
        </Button>
      </Card>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {currentStep === 'amount' ? renderAmountStep() : renderBankDetailsStep()}
    </motion.div>
  );
};