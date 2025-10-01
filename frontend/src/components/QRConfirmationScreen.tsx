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
  User,
  CreditCard,
  MapPin,
  Building,
  DollarSign,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Lock,
  Shield,
  QrCode
} from 'lucide-react';

export const QRConfirmationScreen: React.FC = () => {
  const { setCurrentScreen, qrData, user, addTransaction, updateUserBalance } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    setCurrentScreen('qr-scanner');
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!qrData || !user) return;

    const paymentAmount = showCustomAmount && customAmount 
      ? parseFloat(customAmount.replace(',', '.'))
      : qrData.amount;

    if (paymentAmount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    if (paymentAmount > user.balances.fiat) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create transaction record
      const transaction = {
        id: `tx_${Date.now()}`,
        type: 'pix' as const,
        amount: -paymentAmount, // Negative for outgoing
        currency: qrData.currency,
        date: new Date().toISOString(),
        status: 'completed' as const,
        description: description || qrData.description || 'Pagamento via QR Code',
        pixKey: qrData.pixKey,
        recipientName: qrData.recipientName,
        senderName: user.name
      };

      addTransaction(transaction);
      updateUserBalance('fiat', -paymentAmount);

      toast.success('Pagamento realizado com sucesso!');
      setCurrentScreen('pix');
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Format PIX key for display
  const formatPixKey = (key: string, type: string) => {
    if (type === 'phone') {
      return key.replace(/(\+55)(\d{2})(\d{5})(\d{4})/, '$1 $2 $3-$4');
    }
    if (type === 'cpf') {
      return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return key;
  };

  if (!qrData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3>Dados não encontrados</h3>
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os dados do QR Code.
              </p>
            </div>
            <Button onClick={() => setCurrentScreen('pix-send')} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalAmount = showCustomAmount && customAmount 
    ? parseFloat(customAmount.replace(',', '.'))
    : qrData.amount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-lg">Confirmar Pagamento</h1>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* QR Code Detected Indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-8 h-8 text-[#00C853]" />
          </div>
          <h2 className="text-lg mb-1">QR Code Detectado</h2>
          <p className="text-sm text-muted-foreground">
            Verifique os dados e confirme o pagamento
          </p>
        </motion.div>

        {/* Recipient Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Destinatário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{qrData.recipientName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPixKey(qrData.pixKey, qrData.pixKeyType)}
                </p>
              </div>
              <Badge variant="secondary" className="ml-2">
                {qrData.pixKeyType === 'email' ? 'E-mail' :
                 qrData.pixKeyType === 'phone' ? 'Telefone' :
                 qrData.pixKeyType === 'cpf' ? 'CPF' : 'Chave'}
              </Badge>
            </div>
            
            {qrData.recipientDocument && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-3 h-3" />
                <span>CPF: {qrData.recipientDocument}</span>
              </div>
            )}

            {qrData.bank && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="w-3 h-3" />
                <span>{qrData.bank}</span>
              </div>
            )}

            {qrData.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{qrData.city}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Amount */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-[#007AFF]">
                {formatCurrency(qrData.amount)}
              </p>
              {qrData.amount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomAmount(!showCustomAmount)}
                  className="mt-2"
                  disabled={isProcessing}
                >
                  {showCustomAmount ? 'Usar valor do QR' : 'Alterar valor'}
                </Button>
              )}
            </div>

            {showCustomAmount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="customAmount">Valor personalizado</Label>
                <Input
                  id="customAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={isProcessing}
                />
                {customAmount && (
                  <p className="text-sm text-muted-foreground">
                    Novo valor: {formatCurrency(parseFloat(customAmount.replace(',', '.')) || 0)}
                  </p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrData.description && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">{qrData.description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Adicionar descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Pagamento de produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="border-[#00C853]/20 bg-[#00C853]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-[#00C853]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Transação Segura</p>
                <p className="text-xs text-muted-foreground">
                  Esta transação PIX é protegida por criptografia de ponta a ponta e será processada instantaneamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Check */}
        {user && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo disponível:</span>
                <span className="font-medium">{formatCurrency(user.balances.fiat)}</span>
              </div>
              {finalAmount > user.balances.fiat && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Saldo insuficiente</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-area-pb">
        <div className="space-y-3">
          <Button
            onClick={handleConfirmPayment}
            disabled={isProcessing || (finalAmount > (user?.balances.fiat || 0)) || finalAmount <= 0}
            className="w-full h-12 bg-[#00C853] hover:bg-[#00C853]/90"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Confirmar Pagamento {formatCurrency(finalAmount)}
              </div>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Ao confirmar, você autoriza o débito em sua conta
          </p>
        </div>
      </div>
    </div>
  );
};