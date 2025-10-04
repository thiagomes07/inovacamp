import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { 
  ArrowLeft, 
  Wallet, 
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  Building,
  Shield,
  Info,
  Copy,
  Download,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Loan {
  id: string;
  amount: number;
  nextPayment: number;
  daysUntilPayment: number;
  source: string;
  type: 'pool' | 'direct';
}

interface PaymentFlowProps {
  loan: Loan;
  userBalance: number;
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'auto-debit' | 'pix' | 'boleto' | null;
type PaymentStep = 'method-selection' | 'pix-payment' | 'boleto-payment' | 'processing' | 'success';

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  loan,
  userBalance,
  onBack,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method-selection');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasBalance = userBalance >= loan.nextPayment;
  
  // Mock PIX data
  const pixQrCode = `00020104141234567890123426580014BR.GOV.BCB.PIX014466756C616E6F32343030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030`;
  const pixKey = 'swapin.pagamentos@swapin.com.br';

  const handleAutoDebit = async () => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentStep('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handlePixPayment = () => {
    setSelectedMethod('pix');
    setCurrentStep('pix-payment');
  };

  const handleBoletoPayment = () => {
    setSelectedMethod('boleto');
    setCurrentStep('boleto-payment');
  };

  const confirmPixPayment = async () => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Simulate payment confirmation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setCurrentStep('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const downloadBoleto = () => {
    // Simulate boleto download
    toast.success('Boleto gerado com sucesso!', {
      description: 'O download será iniciado automaticamente'
    });
    
    // Mock payment confirmation after "download"
    setTimeout(() => {
      setIsProcessing(true);
      setCurrentStep('processing');
      
      setTimeout(() => {
        setCurrentStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 2000);
    }, 1000);
  };

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Processando pagamento...</h2>
          <p className="text-gray-400 mb-4">
            Aguarde enquanto confirmamos seu pagamento
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Validando dados de pagamento</p>
            <p>• Processando transação</p>
            <p>• Atualizando saldo do empréstimo</p>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pagamento realizado!</h2>
          <p className="text-gray-300 mb-6">
            Sua parcela foi paga com sucesso
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Valor pago:</span>
                <span className="text-green-400 font-semibold">
                  R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Empréstimo:</span>
                <span className="text-white">{loan.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data:</span>
                <span className="text-white">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Redirecionando para o dashboard...
          </p>
        </Card>
      </div>
    );
  }

  if (currentStep === 'pix-payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep('method-selection')}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Pagamento via PIX</h1>
              <p className="text-sm text-gray-400">
                R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Info */}
          <Card className="backdrop-blur-md bg-blue-500/10 border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Dados para pagamento</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Chave PIX (Email)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={pixKey}
                      readOnly
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(pixKey, 'Chave PIX')}
                      className="border-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${pixQrCode.slice(0, 50)}...`}
                      readOnly
                      className="bg-gray-800/50 border-gray-600 text-white text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(pixQrCode, 'Código PIX')}
                      className="border-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="backdrop-blur-md bg-yellow-500/10 border-yellow-500/30 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Como pagar:</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha PIX → Ler QR Code ou Copia e Cola</li>
                  <li>3. Escaneie o código ou cole a chave PIX</li>
                  <li>4. Confirme o pagamento de R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Confirm Payment Button */}
          <Button
            onClick={confirmPixPayment}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar pagamento
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            O pagamento será confirmado automaticamente em até 2 minutos
          </p>
        </div>
      </div>
    );
  }

  if (currentStep === 'boleto-payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep('method-selection')}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Pagamento via Boleto</h1>
              <p className="text-sm text-gray-400">
                R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Boleto Info */}
          <Card className="backdrop-blur-md bg-orange-500/10 border-orange-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-400" />
              <h2 className="text-lg font-bold text-white">Dados do Boleto</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Valor:</span>
                  <p className="text-white font-semibold">
                    R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Vencimento:</span>
                  <p className="text-white font-semibold">
                    {new Date(Date.now() + loan.daysUntilPayment * 24 * 60 * 60 * 1000)
                      .toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Beneficiário:</span>
                  <p className="text-white font-semibold">Swapin Pagamentos</p>
                </div>
                <div>
                  <span className="text-gray-400">Nosso Número:</span>
                  <p className="text-white font-semibold">000{loan.id.padStart(7, '0')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                  Código de Barras
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value="34191.79001 01043.510047 91020.150008 4 96610000045050"
                    readOnly
                    className="bg-gray-800/50 border-gray-600 text-white font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('34191790010104351004791020150008496610000045050', 'Código de barras')}
                    className="border-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="backdrop-blur-md bg-blue-500/10 border-blue-500/20 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Como pagar:</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Faça o download do boleto</li>
                  <li>• Imprima ou salve no celular</li>
                  <li>• Pague em qualquer banco, lotérica ou app bancário</li>
                  <li>• Use o código de barras para pagamento digital</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Download Button */}
          <Button
            onClick={downloadBoleto}
            className="w-full bg-orange-600 hover:bg-orange-700 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar e baixar boleto
          </Button>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Atenção:</h3>
                <p className="text-sm text-gray-300">
                  O boleto vence hoje às 23:59h. Após o vencimento, podem ser aplicados juros e multa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Method Selection (default view)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Pagar Parcela</h1>
            <p className="text-sm text-gray-400">{loan.source}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Summary */}
        <Card className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Resumo do Pagamento</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-400 text-sm">Valor da parcela</span>
              <p className="text-2xl font-bold text-white">
                R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Vencimento</span>
              <p className="text-lg font-semibold text-yellow-400">
                {loan.daysUntilPayment === 0 ? 'Hoje' : `${loan.daysUntilPayment} dias`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
            <span className="text-gray-300">Empréstimo total:</span>
            <span className="text-white font-semibold">
              R$ {loan.amount.toLocaleString('pt-BR')}
            </span>
          </div>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Escolha a forma de pagamento</h2>

          {/* Auto Debit */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`p-4 border cursor-pointer transition-all ${
              hasBalance 
                ? 'bg-green-500/10 border-green-500/30 hover:border-green-400/50' 
                : 'bg-gray-800/30 border-gray-700 opacity-60 cursor-not-allowed'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasBalance ? 'bg-green-500/20' : 'bg-gray-700/50'
                  }`}>
                    <Wallet className={`w-5 h-5 ${hasBalance ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${hasBalance ? 'text-white' : 'text-gray-500'}`}>
                      Débito do saldo
                    </h3>
                    <p className={`text-sm ${hasBalance ? 'text-gray-300' : 'text-gray-600'}`}>
                      Saldo atual: R$ {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {hasBalance ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Instantâneo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-500">
                      Saldo insuficiente
                    </Badge>
                  )}
                </div>
              </div>
              
              {hasBalance && (
                <Button
                  onClick={handleAutoDebit}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Pagar automaticamente
                </Button>
              )}
            </Card>
          </motion.div>

          {/* PIX */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="p-4 bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50 cursor-pointer transition-all"
              onClick={handlePixPayment}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">PIX</h3>
                    <p className="text-sm text-gray-300">QR Code ou Copia e Cola</p>
                  </div>
                </div>
                
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Até 2 min
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Boleto */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="p-4 bg-orange-500/10 border-orange-500/30 hover:border-orange-400/50 cursor-pointer transition-all"
              onClick={handleBoletoPayment}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Boleto Bancário</h3>
                    <p className="text-sm text-gray-300">Pague em qualquer banco</p>
                  </div>
                </div>
                
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Até 1 dia útil
                </Badge>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Security Info */}
        <Card className="backdrop-blur-md bg-gray-500/10 border-gray-500/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Pagamento Seguro</h3>
              <p className="text-sm text-gray-400">
                Seu pagamento é protegido por criptografia de ponta a ponta. 
                O valor será automaticamente distribuído entre os investidores da pool.
              </p>
            </div>
          </div>
        </Card>

        {/* Late Payment Warning */}
        {loan.daysUntilPayment <= 3 && (
          <Card className="backdrop-blur-md bg-red-500/10 border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">
                  {loan.daysUntilPayment === 0 ? 'Vence hoje!' : 'Vencimento próximo!'}
                </h3>
                <p className="text-sm text-gray-300">
                  {loan.daysUntilPayment === 0 
                    ? 'Esta parcela vence hoje. Pague o quanto antes para evitar juros.'
                    : `Esta parcela vence em ${loan.daysUntilPayment} dia${loan.daysUntilPayment > 1 ? 's' : ''}. Não se esqueça!`
                  }
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};