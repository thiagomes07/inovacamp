import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ArrowRight,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download
} from 'lucide-react';

export const TransactionsHistoryScreen: React.FC = () => {
  const { user, transactions, setCurrentScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (!user) return null;

  // Mock additional transactions for demo
  const allTransactions = [
    ...transactions,
    {
      id: 'tx_004',
      type: 'deposit' as const,
      amount: 1000,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'completed' as const,
      description: 'Bank Transfer Deposit',
      senderName: 'Banco do Brasil'
    },
    {
      id: 'tx_005',
      type: 'send' as const,
      amount: 250,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'completed' as const,
      description: 'PIX Transfer',
      recipientName: 'Maria Silva'
    },
    {
      id: 'tx_006',
      type: 'receive' as const,
      amount: 500,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: 'completed' as const,
      description: 'PIX Received',
      senderName: 'João Santos'
    },
    {
      id: 'tx_007',
      type: 'send' as const,
      amount: 150,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'failed' as const,
      description: 'PIX Transfer - Failed',
      recipientName: 'Pedro Costa'
    },
    {
      id: 'tx_008',
      type: 'deposit' as const,
      amount: 2000,
      currency: 'BRL',
      date: new Date(Date.now() - 86400000 * 6).toISOString(),
      status: 'completed' as const,
      description: 'External Bank Transfer',
      senderName: 'Itaú'
    }
  ];

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      case 'deposit':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'pix':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      default:
        return <ArrowRight className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'send':
        return 'Enviado';
      case 'receive':
        return 'Recebido';
      case 'deposit':
        return 'Depósito';
      case 'pix':
        return 'PIX';
      default:
        return type;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  // Calculate summary stats
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'receive' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'send' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDeposits = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          
          <h1 className="text-xl">Histórico de Transações</h1>
          
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground">Recebido</p>
              <p className="text-lg text-emerald-500">R$ {totalIncome.toLocaleString()}</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground">Enviado</p>
              <p className="text-lg text-red-500">R$ {totalExpenses.toLocaleString()}</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">Depósitos</p>
              <p className="text-lg text-blue-500">R$ {totalDeposits.toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="send">Enviadas</TabsTrigger>
              <TabsTrigger value="receive">Recebidas</TabsTrigger>
              <TabsTrigger value="deposit">Depósitos</TabsTrigger>
              <TabsTrigger value="pix">PIX</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:bg-card/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{formatTransactionType(transaction.type)}</h4>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.recipientName || transaction.senderName || transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'receive' || transaction.type === 'deposit' 
                          ? 'text-emerald-500' 
                          : 'text-foreground'
                      }`}>
                        {(transaction.type === 'receive' || transaction.type === 'deposit') ? '+' : '-'}
                        R$ {transaction.amount.toLocaleString()}
                      </p>
                      <Badge 
                        className={`mt-1 ${getStatusColor(transaction.status)}`}
                      >
                        {formatStatus(transaction.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">Nenhuma transação encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca ou fazer uma nova transação.
              </p>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-sm">Nova Transação</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setCurrentScreen('loans-management')}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Ver Empréstimos</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};