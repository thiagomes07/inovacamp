import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  QrCode,
  ImageIcon,
  Hash,
  Mail,
  Phone,
  User,
  Building,
  CheckCircle
} from 'lucide-react';

export const QRFallbackScreen: React.FC = () => {
  const { setCurrentScreen, setQRData } = useApp();
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [keyType, setKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf');

  // Detect PIX key type
  const detectKeyType = (key: string) => {
    if (key.includes('@')) return 'email';
    if (key.match(/^\d{11}$/)) return 'phone';
    if (key.match(/^\d{11}$/) || key.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) return 'cpf';
    return 'random';
  };

  // Handle PIX key input
  const handlePixKeyChange = (value: string) => {
    setPixKey(value);
    setKeyType(detectKeyType(value));
  };

  // Simulate PIX transaction creation
  const handleCreateTransaction = () => {
    if (!pixKey.trim()) {
      toast.error('Digite uma chave PIX válida');
      return;
    }

    const mockQRData = {
      recipientName: 'Destinatário PIX',
      recipientDocument: '123.456.789-00',
      amount: amount ? parseFloat(amount) : 0,
      currency: 'BRL' as const,
      pixKey: pixKey.trim(),
      pixKeyType: keyType,
      description: description || 'Transferência PIX',
      transactionId: `manual_${Date.now()}`,
      bank: 'Swapin',
      city: 'São Paulo'
    };

    setQRData(mockQRData);
    setCurrentScreen('qr-confirmation');
    toast.success('Transação PIX criada!');
  };

  // Handle file upload
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast.success('Processando imagem...');
        setTimeout(() => {
          const mockQRData = {
            recipientName: 'QR Code Detectado',
            recipientDocument: '123.456.789-00',
            amount: 150.00,
            currency: 'BRL' as const,
            pixKey: 'usuario@email.com',
            pixKeyType: 'email' as const,
            description: 'Pagamento via QR Code',
            transactionId: `img_${Date.now()}`,
            bank: 'Banco Digital',
            city: 'São Paulo'
          };
          setQRData(mockQRData);
          setCurrentScreen('qr-confirmation');
          toast.success('QR Code processado com sucesso!');
        }, 1500);
      }
    };
    input.click();
  };

  const keyTypeIcons = {
    cpf: User,
    email: Mail,
    phone: Phone,
    random: Hash
  };

  const KeyIcon = keyTypeIcons[keyType];

  return (
    <div className="min-h-screen swapin-gradient flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen('pix-send')}
          className="flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-lg font-medium">PIX Manual</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Alternative Options */}
        <div className="space-y-4">
          <Card className="swapin-glass border-white/10">
            <CardContent className="p-4">
              <h2 className="text-white font-medium mb-4">Outras opções de pagamento</h2>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleFileUpload}
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Selecionar QR Code da Galeria
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen('qr-scanner')}
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Tentar Câmera Novamente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual PIX Input */}
          <Card className="swapin-glass border-white/10">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-white font-medium">Inserir dados PIX manualmente</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 text-sm">Chave PIX do destinatário</Label>
                  <div className="relative mt-1">
                    <Input
                      value={pixKey}
                      onChange={(e) => handlePixKeyChange(e.target.value)}
                      placeholder="Digite CPF, email, telefone ou chave aleatória"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <KeyIcon className="absolute left-3 top-3 w-4 h-4 text-white/60" />
                  </div>
                  {pixKey && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">
                        Chave {keyType === 'cpf' ? 'CPF' : keyType === 'email' ? 'Email' : keyType === 'phone' ? 'Telefone' : 'Aleatória'} detectada
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white/80 text-sm">Valor (opcional)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="R$ 0,00"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label className="text-white/80 text-sm">Descrição (opcional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Pagamento de serviços"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <Button
                  onClick={handleCreateTransaction}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  disabled={!pixKey.trim()}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Continuar com PIX
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="swapin-glass border-white/10">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">💡 Dicas importantes</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>• Verifique se a chave PIX está correta antes de continuar</p>
              <p>• Para QR Codes, tente usar boa iluminação</p>
              <p>• Se a câmera não funcionar, permita o acesso nas configurações</p>
              <p>• Você pode colar chaves PIX copiadas de outros apps</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};