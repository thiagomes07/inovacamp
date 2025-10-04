import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';

type BankTransferStep = 'form' | 'processing' | 'success';

interface BankTransferWithdrawProps {
  balance: number;
  onComplete: () => void;
}

const brazilianBanks = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '260', name: 'Nu Pagamentos' },
  { code: '290', name: 'PagSeguro' },
  { code: '323', name: 'Mercado Pago' },
  { code: '336', name: 'C6 Bank' },
  { code: '077', name: 'Inter' },
  { code: '212', name: 'Banco Original' },
  { code: '364', name: 'Gerencianet' },
  { code: '380', name: 'PicPay' },
  { code: '755', name: 'Bank of America' }
];

export const BankTransferWithdraw: React.FC<BankTransferWithdrawProps> = ({
  balance,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<BankTransferStep>('form');
  const [formData, setFormData] = useState({
    bank: '',
    agency: '',
    account: '',
    accountType: '',
    document: '',
    holderName: '',
    amount: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank) newErrors.bank = 'Selecione um banco';
    if (!formData.agency) newErrors.agency = 'Digite a agência';
    if (!formData.account) newErrors.account = 'Digite a conta';
    if (!formData.accountType) newErrors.accountType = 'Selecione o tipo da conta';
    if (!formData.document) newErrors.document = 'Digite o CPF/CNPJ';
    if (!formData.holderName) newErrors.holderName = 'Digite o nome do titular';
    if (!formData.amount) newErrors.amount = 'Digite o valor';

    // Validate amount
    const amount = parseFloat(formData.amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (amount < 10) newErrors.amount = 'Valor mínimo: R$ 10,00';
    if (amount > balance) newErrors.amount = 'Valor excede o saldo disponível';

    // Validate CPF/CNPJ format (basic)
    if (formData.document && !formData.document.match(/(\d{3}\.\d{3}\.\d{3}-\d{2})|(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)) {
      newErrors.document = 'CPF/CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Corrija os erros no formulário');
      return;
    }

    setCurrentStep('processing');
    
    // Simulate processing
    setTimeout(() => {
      setCurrentStep('success');
      toast.success('Transferência solicitada com sucesso!');
    }, 3000);
  };

  const selectedBank = brazilianBanks.find(bank => bank.code === formData.bank);

  return (
    <div className="p-6 space-y-6 pb-20">
      <motion.div
        key={currentStep}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 'form' && (
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Dados da conta bancária
            </h2>
            
            <div className="space-y-4">
              {/* Bank Selection */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Banco *
                </label>
                <Select value={formData.bank} onValueChange={(value) => setFormData(prev => ({...prev, bank: value}))}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianBanks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.code} - {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank && <p className="text-red-400 text-sm mt-1">{errors.bank}</p>}
              </div>

              {/* Agency and Account */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Agência *
                  </label>
                  <Input
                    value={formData.agency}
                    onChange={(e) => setFormData(prev => ({...prev, agency: e.target.value}))}
                    placeholder="0000"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    maxLength={6}
                  />
                  {errors.agency && <p className="text-red-400 text-sm mt-1">{errors.agency}</p>}
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Conta *
                  </label>
                  <Input
                    value={formData.account}
                    onChange={(e) => setFormData(prev => ({...prev, account: e.target.value}))}
                    placeholder="00000-0"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    maxLength={12}
                  />
                  {errors.account && <p className="text-red-400 text-sm mt-1">{errors.account}</p>}
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Tipo da conta *
                </label>
                <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({...prev, accountType: value}))}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
                {errors.accountType && <p className="text-red-400 text-sm mt-1">{errors.accountType}</p>}
              </div>

              {/* Document */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  CPF/CNPJ do titular *
                </label>
                <MaskedInput
                  mask="cpf"
                  value={formData.document}
                  onChange={(value) => setFormData(prev => ({...prev, document: value}))}
                  placeholder="000.000.000-00"
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                {errors.document && <p className="text-red-400 text-sm mt-1">{errors.document}</p>}
              </div>

              {/* Holder Name */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Nome completo do titular *
                </label>
                <Input
                  value={formData.holderName}
                  onChange={(e) => setFormData(prev => ({...prev, holderName: e.target.value}))}
                  placeholder="Nome completo como no banco"
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                {errors.holderName && <p className="text-red-400 text-sm mt-1">{errors.holderName}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Valor da transferência *
                </label>
                <MaskedInput
                  mask="money"
                  value={formData.amount}
                  onChange={(value) => setFormData(prev => ({...prev, amount: value}))}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600 text-white text-xl"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Disponível: R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-400 text-sm">
                  Mínimo: R$ 10,00
                </p>
                {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
              </div>

              {/* Info Card */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Processamento</span>
                </div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• O dinheiro chegará em 1-2 dias úteis</li>
                  <li>• Transferências solicitadas após 17h são processadas no próximo dia útil</li>
                  <li>• Não há taxa para transferências bancárias</li>
                </ul>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                Solicitar Transferência
              </Button>
            </div>
          </Card>
        )}

        {currentStep === 'processing' && (
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Processando transferência...
            </h2>
            
            <p className="text-gray-300 mb-6">
              Validando dados bancários e processando sua solicitação
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Validando conta...</span>
                  <span className="text-blue-400">100%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full transition-all duration-1000" />
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Enviando para o banco...</span>
                  <span className="text-yellow-400">Processando</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full w-3/4 transition-all duration-2000" />
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 'success' && (
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Transferência solicitada! ✅
            </h2>
            
            <p className="text-gray-300 mb-6">
              O dinheiro chegará em até 2 dias úteis
            </p>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-3">📋 Resumo da transferência</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white font-semibold">
                    {formData.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Banco:</span>
                  <span className="text-white">{selectedBank?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Agência:</span>
                  <span className="text-white">{formData.agency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conta:</span>
                  <span className="text-white">{formData.account} ({formData.accountType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Titular:</span>
                  <span className="text-white">{formData.holderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prazo:</span>
                  <span className="text-white">1-2 dias úteis</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-green-400 font-semibold text-sm">Transferência confirmada</p>
                  <p className="text-gray-300 text-sm">
                    Você receberá uma notificação quando o dinheiro estiver disponível na sua conta bancária.
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700 py-3"
            >
              Concluir
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
};