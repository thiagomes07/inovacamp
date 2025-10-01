import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Send,
  QrCode,
  Key,
  Clock,
  Eye,
  Plus,
  Smartphone,
  Mail,
  CreditCard,
  Hash,
  Copy,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PIXKey {
  id: string;
  type: 'phone' | 'email' | 'cpf' | 'random';
  value: string;
  isActive: boolean;
  createdAt: string;
}

interface PIXTransaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipientName?: string;
  senderName?: string;
  pixKey: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

export const PIXScreen: React.FC = () => {
  const { setCurrentScreen, user, addTransaction } = useApp();
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'keys' | 'history'>('send');
  
  // Mock PIX keys
  const [pixKeys, setPixKeys] = useState<PIXKey[]>([
    {
      id: 'key_001',
      type: 'phone',
      value: '+55 11 99999-9999',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'key_002',
      type: 'email',
      value: user?.email || 'user@swapin.com',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
    }
  ]);

  // Mock PIX transactions
  const [pixTransactions] = useState<PIXTransaction[]>([
    {
      id: 'pix_001',
      type: 'received',
      amount: 150.00,
      senderName: 'João Silva',
      pixKey: '+55 11 98888-8888',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      description: 'Pagamento freelance'
    },
    {
      id: 'pix_002',
      type: 'sent',
      amount: 75.50,
      recipientName: 'Maria Santos',
      pixKey: 'maria@email.com',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'completed',
      description: 'Divisão conta restaurante'
    }
  ]);

  const generateRandomKey = () => {
    const randomKey = Math.random().toString(36).substring(2, 15);
    const newKey: PIXKey = {
      id: `key_${Date.now()}`,
      type: 'random',
      value: randomKey,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setPixKeys(prev => [...prev, newKey]);
    toast.success('Chave PIX aleatória criada com sucesso!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const getKeyIcon = (type: PIXKey['type']) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'cpf':
        return <CreditCard className="w-4 h-4" />;
      case 'random':
        return <Hash className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSendTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#007AFF]" />
            Enviar PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setCurrentScreen('pix-send')}
            className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/80"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar dinheiro
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Transfira dinheiro instantaneamente usando chave PIX, QR Code ou dados bancários
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transferências recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixTransactions
              .filter(tx => tx.type === 'sent')
              .slice(0, 3)
              .map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Send className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.recipientName}</p>
                      <p className="text-sm text-muted-foreground">{tx.pixKey}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-{formatCurrency(tx.amount)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReceiveTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#00C853]" />
            Receber PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setCurrentScreen('pix-receive')}
            className="w-full h-12 bg-[#00C853] hover:bg-[#00C853]/80"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Gerar QR Code
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Crie um QR Code para receber pagamentos instantâneos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas chaves PIX</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixKeys.slice(0, 2).map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00C853]/10 flex items-center justify-center">
                    {getKeyIcon(key.type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{key.type === 'random' ? 'Chave aleatória' : key.type}</p>
                    <p className="text-sm text-muted-foreground">{key.value}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(key.value)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recebimentos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixTransactions
              .filter(tx => tx.type === 'received')
              .slice(0, 3)
              .map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.senderName}</p>
                      <p className="text-sm text-muted-foreground">{tx.pixKey}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{formatCurrency(tx.amount)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderKeysTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#FFD700]" />
            Gerenciar chaves PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateRandomKey}
            className="w-full h-12 bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar chave aleatória
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Você pode ter até 5 chaves PIX ativas por conta
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas chaves ({pixKeys.length}/5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                    {getKeyIcon(key.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">
                        {key.type === 'random' ? 'Chave aleatória' : key.type}
                      </p>
                      <Badge variant={key.isActive ? 'default' : 'secondary'}>
                        {key.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{key.value}</p>
                    <p className="text-xs text-muted-foreground">
                      Criada em {formatDate(key.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(key.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Histórico PIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'sent' 
                      ? 'bg-red-100' 
                      : 'bg-green-100'
                  }`}>
                    {tx.status === 'completed' ? (
                      <CheckCircle className={`w-4 h-4 ${
                        tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`} />
                    ) : tx.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'sent' ? tx.recipientName : tx.senderName}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.pixKey}</p>
                    {tx.description && (
                      <p className="text-xs text-muted-foreground">{tx.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.type === 'sent' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                  <Badge variant={
                    tx.status === 'completed' ? 'default' :
                    tx.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {tx.status === 'completed' ? 'Concluído' :
                     tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'send', label: 'Enviar', icon: Send },
    { id: 'receive', label: 'Receber', icon: QrCode },
    { id: 'keys', label: 'Chaves', icon: Key },
    { id: 'history', label: 'Histórico', icon: Clock }
  ] as const;

  return (
    <div className="min-h-screen bg-background safe-area-pb">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('home')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">PIX</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-30 bg-background border-b">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 relative ${
                  activeTab === tab.id
                    ? 'text-[#007AFF]'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'send' && renderSendTab()}
          {activeTab === 'receive' && renderReceiveTab()}
          {activeTab === 'keys' && renderKeysTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </motion.div>
      </div>
    </div>
  );
};