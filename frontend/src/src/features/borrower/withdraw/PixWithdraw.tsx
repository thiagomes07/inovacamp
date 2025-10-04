import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Copy, 
  Keyboard, 
  Camera, 
  CheckCircle, 
  Share,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';

type PixMethod = 'select' | 'qr-code' | 'copy-paste' | 'manual-key' | 'confirm-amount' | 'biometric' | 'processing' | 'receipt';

interface PixWithdrawProps {
  balance: number;
  onComplete: () => void;
}

export const PixWithdraw: React.FC<PixWithdrawProps> = ({
  balance,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<PixMethod>('select');
  const [pixData, setPixData] = useState({
    method: '',
    code: '',
    key: '',
    amount: '',
    recipient: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleQRCodeScan = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      setIsScanning(false);
      setPixData(prev => ({
        ...prev,
        method: 'qr-code',
        code: '00020126580014BR.GOV.BCB.PIX01364b4c2e8b-8e4d-4c8a-9f2e-3d1a2b3c4d5e6f5204000053039865802BR5925João Santos Silva63040B2D',
        amount: '150.00',
        recipient: 'João Santos Silva'
      }));
      setCurrentStep('confirm-amount');
      toast.success('QR Code lido com sucesso!');
    }, 2000);
  };

  const handleCopyPaste = () => {
    if (!pixData.code.trim()) {
      toast.error('Cole o código PIX no campo acima');
      return;
    }
    
    // Simulate parsing PIX code
    setPixData(prev => ({
      ...prev,
      method: 'copy-paste',
      amount: '250.00',
      recipient: 'Maria Silva Santos'
    }));
    setCurrentStep('confirm-amount');
    toast.success('Código PIX processado!');
  };

  const handleManualKey = () => {
    if (!pixData.key.trim()) {
      toast.error('Digite uma chave PIX válida');
      return;
    }
    
    setPixData(prev => ({
      ...prev,
      method: 'manual-key',
      recipient: 'Destinatário'
    }));
    setCurrentStep('confirm-amount');
  };

  const handleConfirmAmount = () => {
    const amount = parseFloat(pixData.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    
    if (amount > balance) {
      toast.error('Valor excede o saldo disponível');
      return;
    }

    if (amount > 500) {
      setCurrentStep('biometric');
    } else {
      processPixPayment();
    }
  };

  const handleBiometricVerification = () => {
    // Simulate biometric verification
    setTimeout(() => {
      processPixPayment();
    }, 2000);
  };

  const processPixPayment = () => {
    setCurrentStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setCurrentStep('receipt');
      toast.success('PIX enviado com sucesso!');
    }, 3000);
  };

  const handleShare = () => {
    const receiptText = `
🧾 Comprovante PIX - Swapin

💰 Valor: R$ ${parseFloat(pixData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
👤 Para: ${pixData.recipient}
📅 Data: ${new Date().toLocaleString('pt-BR')}
🔢 ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

✅ Transação realizada com sucesso
    `;
    
    if (navigator.share) {
      navigator.share({
        title: 'Comprovante PIX',
        text: receiptText
      });
    } else {
      navigator.clipboard.writeText(receiptText);
      toast.success('Comprovante copiado para área de transferência!');
    }
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'select' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Como você quer pagar?
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentStep('qr-code')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-green-500 hover:bg-green-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-white font-semibold">Ler QR Code</h3>
                      <p className="text-gray-400 text-sm">Aponte a câmera para o código</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentStep('copy-paste')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Copy className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-white font-semibold">Copia e Cola</h3>
                      <p className="text-gray-400 text-sm">Cole o código PIX copiado</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentStep('manual-key')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-white font-semibold">Inserir Chave</h3>
                      <p className="text-gray-400 text-sm">CPF, email, celular ou chave aleatória</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          )}

          {currentStep === 'qr-code' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Escaneie o QR Code
              </h2>
              
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-64 h-64 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-600">
                    {!isScanning ? (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Aponte a câmera para o QR Code</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-green-400 text-sm">Lendo QR Code...</p>
                      </div>
                    )}
                  </div>
                  
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-green-500 rounded-xl opacity-50">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500" />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleQRCodeScan}
                  disabled={isScanning}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  {isScanning ? 'Escaneando...' : 'Iniciar Câmera'}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'copy-paste' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Cole o código PIX
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Código PIX copiado
                  </label>
                  <textarea
                    value={pixData.code}
                    onChange={(e) => setPixData(prev => ({...prev, code: e.target.value}))}
                    placeholder="00020126580014BR.GOV.BCB.PIX..."
                    className="w-full h-24 bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 resize-none"
                  />
                </div>

                <Button
                  onClick={handleCopyPaste}
                  disabled={!pixData.code.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                >
                  Processar Código PIX
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'manual-key' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Digite a chave PIX
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Chave PIX do destinatário
                  </label>
                  <Input
                    value={pixData.key}
                    onChange={(e) => setPixData(prev => ({...prev, key: e.target.value}))}
                    placeholder="CPF, email, celular ou chave aleatória"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Ex: 000.000.000-00, email@exemplo.com, (11) 99999-9999
                  </p>
                </div>

                <Button
                  onClick={handleManualKey}
                  disabled={!pixData.key.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                >
                  Continuar
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'confirm-amount' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Confirme os dados
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Para</p>
                      <p className="text-white font-semibold">{pixData.recipient}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Valor a enviar
                  </label>
                  <MaskedInput
                    mask="money"
                    value={pixData.amount}
                    onChange={(value) => setPixData(prev => ({...prev, amount: value}))}
                    placeholder="R$ 0,00"
                    className="bg-gray-800/50 border-gray-600 text-white text-xl"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Disponível: R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {parseFloat(pixData.amount.replace(',', '.')) > 500 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Verificação Necessária</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Valores acima de R$ 500 requerem verificação biométrica para segurança
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleConfirmAmount}
                  disabled={!pixData.amount || parseFloat(pixData.amount.replace(',', '.')) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  Confirmar PIX
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'biometric' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação Biométrica
              </h2>
              
              <p className="text-gray-300 mb-6">
                Posicione seu rosto na câmera para confirmar a transação
              </p>
              
              <div className="w-32 h-32 mx-auto mb-6 border-4 border-blue-500 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500/40 rounded-full" />
                </div>
              </div>
              
              <Button
                onClick={handleBiometricVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                Iniciar Verificação
              </Button>
            </Card>
          )}

          {currentStep === 'processing' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Processando PIX...
              </h2>
              
              <p className="text-gray-300 mb-6">
                Sua transação está sendo processada
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Convertendo saldo...</span>
                    <span className="text-blue-400">100%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-full transition-all duration-1000" />
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Enviando PIX...</span>
                    <span className="text-green-400">Processando</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-3/4 transition-all duration-2000" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 'receipt' && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                PIX enviado com sucesso! ✅
              </h2>
              
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
                <h3 className="text-white font-semibold mb-3">🧾 Comprovante</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-white font-semibold">
                      R$ {parseFloat(pixData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Para:</span>
                    <span className="text-white">{pixData.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white">{new Date().toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Compartilhar Comprovante
                </Button>
                
                <Button
                  onClick={onComplete}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  Concluir
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};