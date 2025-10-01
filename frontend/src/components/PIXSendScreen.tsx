import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Send,
  QrCode,
  Smartphone,
  Mail,
  CreditCard,
  Hash,
  User,
  DollarSign,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Camera
} from 'lucide-react';

export const PIXSendScreen: React.FC = () => {
  const { setCurrentScreen, user, addTransaction } = useApp();
  const [step, setStep] = useState<'method' | 'key' | 'amount' | 'confirm' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'key' | 'qr' | 'manual'>('key');
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);

  const validatePixKey = async (key: string) => {
    setIsValidatingKey(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsValidatingKey(false);
    
    // Mock validation - in real app this would call PIX API
    if (key.includes('@') || key.includes('+55') || key.length === 32) {
      setRecipientName('João Silva Santos');
      return true;
    }
    
    toast.error('Chave PIX não encontrada');
    return false;
  };

  const handleKeySubmit = async () => {
    if (!pixKey.trim()) {
      toast.error('Digite uma chave PIX válida');
      return;
    }

    const isValid = await validatePixKey(pixKey);
    if (isValid) {
      setStep('amount');
    }
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    
    if (numAmount > (user?.balances.fiat || 0)) {
      toast.error('Saldo insuficiente');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmTransaction = () => {
    const numAmount = parseFloat(amount);
    
    // Add transaction to history
    addTransaction({
      id: `pix_${Date.now()}`,
      type: 'send',
      amount: numAmount,
      currency: 'BRL',
      date: new Date().toISOString(),
      status: 'completed',
      description: `PIX para ${recipientName}`
    });

    // Update user balance (would be handled by backend in real app)
    if (user) {
      const updatedUser = {
        ...user,
        balances: {
          ...user.balances,
          fiat: user.balances.fiat - numAmount
        }
      };
      // This would be handled by the context in a real app
    }

    setStep('success');
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d]/g, '')) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = (parseFloat(numericValue) / 100).toFixed(2);
    setAmount(formattedValue);
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Como você quer enviar?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => {
              setSelectedMethod('key');
              setStep('key');
            }}
            className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div>
                <p className="font-medium">Chave PIX</p>
                <p className="text-sm text-muted-foreground">
                  Digite ou cole a chave PIX do destinatário
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedMethod('qr');
              setCurrentScreen('qr-scanner');
            }}
            className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00C853]/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#00C853]" />
              </div>
              <div>
                <p className="font-medium">QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Escaneie o código QR do destinatário
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedMethod('manual');
              toast.info('Função de dados bancários em desenvolvimento');
            }}
            className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="font-medium">Dados bancários</p>
                <p className="text-sm text-muted-foreground">
                  Digite os dados bancários manualmente
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );

  const renderKeyInput = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Digite a chave PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pixKey">Chave PIX do destinatário</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, telefone, e-mail ou chave aleatória"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemplo: 11999999999, email@exemplo.com ou chave aleatória
            </p>
          </div>

          {isValidatingKey && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-blue-700">Validando chave PIX...</p>
            </div>
          )}

          <Button 
            onClick={handleKeySubmit}
            disabled={!pixKey.trim() || isValidatingKey}
            className="w-full bg-[#007AFF] hover:bg-[#007AFF]/80"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tipos de chave PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            <span>Telefone: +55 11 99999-9999</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>E-mail: exemplo@email.com</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            <span>CPF: 000.000.000-00</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span>Chave aleatória: 32 caracteres</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAmountInput = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Destinatário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">{recipientName}</p>
              <p className="text-sm text-green-600">{pixKey}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Qual valor você quer enviar?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                value={formatCurrency(amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="R$ 0,00"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo disponível: {formatCurrency((user?.balances.fiat || 0).toString())}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivo do pagamento"
              className="mt-1"
              maxLength={140}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/140 caracteres
            </p>
          </div>

          <Button 
            onClick={handleAmountSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-[#007AFF] hover:bg-[#007AFF]/80"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirme os dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destinatário:</span>
              <span className="font-medium">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chave PIX:</span>
              <span className="font-medium">{pixKey}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-semibold text-lg">{formatCurrency(amount)}</span>
            </div>
            {description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descrição:</span>
                <span className="font-medium text-right max-w-[60%]">{description}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Atenção:</strong> Verifique todos os dados antes de confirmar. 
              Transferências PIX são instantâneas e não podem ser canceladas.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setStep('amount')}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button 
              onClick={handleConfirmTransaction}
              className="flex-1 bg-[#007AFF] hover:bg-[#007AFF]/80"
            >
              Confirmar PIX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-800">PIX enviado com sucesso!</h3>
            <p className="text-muted-foreground">
              Sua transferência foi processada instantaneamente
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Valor enviado:</span>
              <span className="font-semibold text-green-800">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Para:</span>
              <span className="font-medium text-green-800">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Horário:</span>
              <span className="font-medium text-green-800">
                {new Date().toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setStep('method');
                setPixKey('');
                setAmount('');
                setDescription('');
                setRecipientName('');
              }}
              className="flex-1"
            >
              Novo PIX
            </Button>
            <Button 
              onClick={() => setCurrentScreen('pix')}
              className="flex-1 bg-[#007AFF] hover:bg-[#007AFF]/80"
            >
              Voltar ao PIX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'method':
        return 'Enviar PIX';
      case 'key':
        return 'Chave PIX';
      case 'amount':
        return 'Valor';
      case 'confirm':
        return 'Confirmar';
      case 'success':
        return 'Concluído';
      default:
        return 'PIX';
    }
  };

  return (
    <div className="min-h-screen bg-background safe-area-pb">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'method') {
                setCurrentScreen('pix');
              } else if (step === 'key') {
                setStep('method');
              } else if (step === 'amount') {
                setStep('key');
              } else if (step === 'confirm') {
                setStep('amount');
              } else {
                setCurrentScreen('pix');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">{getStepTitle()}</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Progress indicator */}
      {step !== 'success' && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Passo {step === 'method' ? 1 : step === 'key' ? 2 : step === 'amount' ? 3 : 4} de 4
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-[#007AFF] h-1 rounded-full transition-all duration-300"
              style={{ 
                width: step === 'method' ? '25%' : 
                       step === 'key' ? '50%' : 
                       step === 'amount' ? '75%' : '100%' 
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'method' && renderMethodSelection()}
          {step === 'key' && renderKeyInput()}
          {step === 'amount' && renderAmountInput()}
          {step === 'confirm' && renderConfirmation()}
          {step === 'success' && renderSuccess()}
        </motion.div>
      </div>
    </div>
  );
};