import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Star, 
  Plus,
  Send,
  Download,
  ArrowLeft,
  Info,
  DollarSign,
  Clock,
  Check,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { useAuth } from '../../shared/hooks/useAuth';
import { useWallet } from '../../shared/hooks/useWallet';
import { useCredit } from '../../shared/hooks/useCredit';
import { BottomNavigation } from '../../shared/components/ui/BottomNavigation';
import { CreditRequestFlow } from './credit-request/CreditRequestFlow';
import { WithdrawFlow } from './withdraw/WithdrawFlow';
import { DepositFlow } from './deposit/DepositFlow';
import { ScoreImprovement } from './score/ScoreImprovement';
import { PaymentFlow } from './payment/PaymentFlow';
import { toast } from 'sonner@2.0.3';

type DashboardView = 'main' | 'deposit' | 'withdraw' | 'request-credit' | 'score-info' | 'statement' | 'payment';

interface Loan {
  id: string;
  amount: number;
  nextPayment: number;
  daysUntilPayment: number;
  source: string;
  type: 'pool' | 'direct';
}

export const BorrowerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { getCreditLimit, getAvailableCredit } = useCredit();
  const [currentView, setCurrentView] = useState<DashboardView>('main');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [creditAmount, setCreditAmount] = useState('');

  const mockLoans: Loan[] = [
    {
      id: '1',
      amount: 5000,
      nextPayment: 450.50,
      daysUntilPayment: 12,
      source: 'Pool Diversificação Brasil',
      type: 'pool'
    },
    {
      id: '2',
      amount: 2000,
      nextPayment: 180.00,
      daysUntilPayment: 8,
      source: 'João Santos',
      type: 'direct'
    }
  ];

  const mockTransactions = [
    {
      id: '1',
      type: 'loan_received',
      amount: 5000,
      date: '2024-10-01',
      description: 'Empréstimo aprovado - Pool Diversificação'
    },
    {
      id: '2',
      type: 'deposit',
      amount: 1000,
      date: '2024-10-01',
      description: 'Depósito via PIX'
    },
    {
      id: '3',
      type: 'loan_payment',
      amount: -450.50,
      date: '2024-09-30',
      description: 'Pagamento parcela 1/12'
    }
  ];

  const creditLimit = getCreditLimit();
  const approvedCredit = getAvailableCredit();
  const scoreProgress = (user?.score || 0) / 1000 * 100;

  const handleRequestCredit = () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      toast.error('Digite um valor válido para o crédito');
      return;
    }
    
    if (parseFloat(creditAmount) > approvedCredit) {
      toast.error('Valor excede o limite aprovado');
      return;
    }
    
    toast.success(`Solicitação de crédito de R$ ${parseFloat(creditAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviada!`);
    setCreditAmount('');
    setCurrentView('main');
  };



  if (currentView === 'deposit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <DepositFlow
          onBack={() => setCurrentView('main')}
          onComplete={() => {
            setCurrentView('main');
            toast.success('Depósito processado com sucesso!');
          }}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="borrower"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'withdraw') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <WithdrawFlow
          balance={balance.brl}
          onBack={() => setCurrentView('main')}
          onComplete={() => {
            setCurrentView('main');
            toast.success('Envio processado com sucesso!');
          }}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="borrower"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'request-credit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <CreditRequestFlow
          onBack={() => setCurrentView('main')}
          onComplete={() => {
            setCurrentView('main');
            toast.success('Solicitação de crédito concluída com sucesso!');
          }}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="borrower"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'score-info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <ScoreImprovement 
          onBack={() => setCurrentView('main')}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="borrower"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'payment' && selectedLoan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <PaymentFlow
          loan={selectedLoan}
          userBalance={balance.brl}
          onBack={() => {
            setCurrentView('main');
            setSelectedLoan(null);
          }}
          onSuccess={() => {
            setCurrentView('main');
            setSelectedLoan(null);
            toast.success('Pagamento processado com sucesso!');
          }}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="borrower"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400">Bem-vindo de volta ao Swapin</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="w-12 h-12 bg-transparent border-2 border-red-500 hover:bg-red-500/10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                title="Sair da conta"
              >
                <LogOut className="w-5 h-5 text-red-500" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="backdrop-blur-md bg-gray-900/95 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-red-500" />
                  Confirmar Logout
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o Swapin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    logout();
                    toast.success('Logout realizado com sucesso!');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] bg-[length:4px_4px]"></div>
        {/* Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Saldo Disponível */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Saldo Disponível</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  R$ {balance.brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Crédito Aprovado */}
              <div>
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-300 text-right">Crédito Aprovado</h3>
                </div>
                <p className="text-2xl font-bold text-white text-right">
                  R$ {approvedCredit.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 flex-1 min-w-[90px]"
                onClick={() => setCurrentView('deposit')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Receber
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-gray-600 text-[rgba(0,0,0,1)] hover:bg-gray-700 hover:text-white flex-1 min-w-[90px]"
                onClick={() => setCurrentView('withdraw')}
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[100px]"
                onClick={() => setCurrentView('request-credit')}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Pedir Crédito
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center justify-between mb-[-2px] mt-[0px] mr-[0px] ml-[0px]">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Score Swapin</h2>
              </div>
              <span className="text-yellow-400 font-semibold">{user?.scoreLevel}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-bold text-2xl">{user?.score}</span>
                  <span className="text-gray-400 text-sm">de 1000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${scoreProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-blue-400 text-sm">
                  💡 Score &gt;700 = 85% das pools compatíveis
                </p>
              </div>
              
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm border-0"
                onClick={() => setCurrentView('score-info')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Aumentar score
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Active Loans */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Empréstimos Ativos</h2>
            </div>
            
            <div className="space-y-3">
              {mockLoans.map((loan) => (
                <div 
                  key={loan.id}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold">
                        R$ {loan.amount.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-gray-400 text-sm">{loan.source}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        loan.type === 'pool' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {loan.type === 'pool' ? 'Pool' : 'Direto'}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 font-medium hover:scale-[1.02] transition-all duration-300"
                      onClick={() => {
                        // Set payment view with loan data
                        setCurrentView('payment');
                        // Store selected loan for payment flow
                        setSelectedLoan(loan);
                      }}
                    >
                      Pagar
                    </Button>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Próxima parcela:</span>
                    <span className="text-white">
                      R$ {loan.nextPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vencimento:</span>
                    <span className="text-yellow-400">{loan.daysUntilPayment} dias</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Histórico Recente</h2>
              </div>

            </div>
            
            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.amount > 0 ? (
                        <Download className="w-4 h-4 text-green-400" />
                      ) : (
                        <Send className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">{transaction.description}</p>
                      <p className="text-gray-400 text-xs">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}
                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        userType="borrower"
        activeTab={currentView}
        onTabChange={setCurrentView}
      />
    </div>
  );
};