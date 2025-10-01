import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  QrCode,
  Copy,
  Share,
  Download,
  DollarSign,
  MessageSquare,
  User,
  RefreshCw,
  Timer,
  Smartphone,
  Mail
} from 'lucide-react';

export const PIXReceiveScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [step, setStep] = useState<'amount' | 'qrcode'>('amount');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  // Mock PIX keys from user
  const pixKeys = [
    { type: 'phone', value: '+55 11 99999-9999', label: 'Telefone' },
    { type: 'email', value: user?.email || 'user@swapin.com', label: 'E-mail' },
  ];

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

  const generateQRCode = () => {
    if (!selectedKey) {
      toast.error('Selecione uma chave PIX');
      return;
    }

    // Generate mock QR code data
    const qrData = `PIX|${selectedKey}|${amount || '0'}|${description}|${Date.now()}`;
    setQrCodeData(qrData);
    setStep('qrcode');
    toast.success('QR Code gerado com sucesso!');
  };

  const copyQRCode = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast.success('Código copiado para a área de transferência');
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pagar com PIX - Swapin',
          text: `Pague ${amount ? formatCurrency(amount) : 'qualquer valor'} via PIX`,
          url: `https://swapin.com/pay?code=${btoa(qrCodeData)}`
        });
      } catch (error) {
        copyQRCode();
      }
    } else {
      copyQRCode();
    }
  };

  const downloadQRCode = () => {
    // Create a simple QR code representation as SVG
    const svg = generateQRSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pix-qrcode-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('QR Code baixado');
  };

  const generateQRSVG = () => {
    // Simple QR code pattern for demo purposes
    const size = 200;
    const moduleSize = 8;
    const modules = size / moduleSize;
    
    let pattern = '';
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        // Simple pattern based on QR data
        const shouldFill = (i + j + qrCodeData.length) % 3 === 0;
        if (shouldFill) {
          pattern += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#000"/>`;
        }
      }
    }

    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#fff"/>
        ${pattern}
      </svg>
    `;
  };

  const renderAmountInput = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configure seu PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pixKey">Escolha sua chave PIX</Label>
            <div className="space-y-2 mt-2">
              {pixKeys.map((key, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedKey(key.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedKey === key.value
                      ? 'border-[#007AFF] bg-[#007AFF]/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                      {key.type === 'phone' ? (
                        <Smartphone className="w-4 h-4 text-[#007AFF]" />
                      ) : (
                        <Mail className="w-4 h-4 text-[#007AFF]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{key.label}</p>
                      <p className="text-sm text-muted-foreground">{key.value}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Valor (opcional)</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                value={amount ? formatCurrency(amount) : ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="R$ 0,00 (deixe vazio para valor livre)"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se não informar o valor, quem pagar poderá escolher quanto enviar
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
            onClick={generateQRCode}
            disabled={!selectedKey}
            className="w-full bg-[#00C853] hover:bg-[#00C853]/80"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Gerar QR Code
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Compartilhe o QR Code com quem vai te pagar</p>
          <p>• A pessoa escaneia o código no app do banco</p>
          <p>• O dinheiro cai na sua conta instantaneamente</p>
          <p>• Você recebe uma notificação do pagamento</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderQRCode = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Seu QR Code PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div 
              ref={qrRef}
              className="w-64 h-64 bg-white rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: generateQRSVG() }}
            />
          </div>

          {/* Transaction Details */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Destinatário:</strong> {user?.name || 'Usuário Swapin'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Chave:</strong> {selectedKey}
              </span>
            </div>
            {amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Valor:</strong> {formatCurrency(amount)}
                </span>
              </div>
            )}
            {description && (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Descrição:</strong> {description}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyQRCode}
              className="flex-col h-auto py-3"
            >
              <Copy className="w-4 h-4 mb-1" />
              <span className="text-xs">Copiar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareQRCode}
              className="flex-col h-auto py-3"
            >
              <Share className="w-4 h-4 mb-1" />
              <span className="text-xs">Compartilhar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex-col h-auto py-3"
            >
              <Download className="w-4 h-4 mb-1" />
              <span className="text-xs">Baixar</span>
            </Button>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setStep('amount')}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Novo QR Code
            </Button>
            <Button 
              onClick={() => setCurrentScreen('pix')}
              className="flex-1 bg-[#007AFF] hover:bg-[#007AFF]/80"
            >
              Concluir
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4" />
            Informações importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Este QR Code não expira</p>
          <p>• Você pode usar quantas vezes quiser</p>
          <p>• Os pagamentos são processados instantaneamente</p>
          <p>• Você receberá notificação de cada pagamento</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background safe-area-pb">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'amount') {
                setCurrentScreen('pix');
              } else {
                setStep('amount');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">
            {step === 'amount' ? 'Receber PIX' : 'QR Code PIX'}
          </h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'amount' && renderAmountInput()}
          {step === 'qrcode' && renderQRCode()}
        </motion.div>
      </div>
    </div>
  );
};