import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PIXSendMethodsModal } from './PIXSendMethodsModal';
import { PIXReceiveMethodsModal } from './PIXReceiveMethodsModal';
import { InvestorDepositModal } from './InvestorDepositModal';
import { toast } from 'sonner@2.0.3';
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Plus,
  ArrowRight,
  DollarSign,
  Calendar,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Upload
} from 'lucide-react';

export const BorrowerHome: React.FC = () => {
  const { 
    user, 
    loans, 
    transactions, 
    setCurrentScreen, 
    updateUserBalance,
    addTransaction 
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  if (!user) return null;

  const activeLoans = loans.filter(loan => 
    loan.borrowerId === user.id && ['active', 'overdue'].includes(loan.status)
  );
  
  const overdueLoan = activeLoans.find(loan => loan.status === 'overdue');
  const recentTransactions = transactions.slice(0, 3);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    toast.success('Balance updated');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <Avatar className="w-14 h-14 border-2 border-white/20 shadow-lg">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white/70 text-sm">Bom dia</p>
              <h1 className="text-white text-2xl font-bold">{user.name.split(' ')[0]}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentScreen('credit-score-details')}
              className="w-12 h-12 swapin-glass rounded-2xl flex items-center justify-center"
            >
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </button>
            <button
              onClick={() => setCurrentScreen('transactions-history')}
              className="w-12 h-12 swapin-glass rounded-2xl flex items-center justify-center"
            >
              <Clock className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentScreen('config')}
              className="w-12 h-12 swapin-glass rounded-2xl flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="swapin-glass p-8 rounded-3xl backdrop-blur-xl relative z-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm mb-1">Saldo Disponível</p>
              <div className="flex items-center space-x-3">
                <h2 className="text-white text-3xl font-bold">R$ {user.balances.fiat.toLocaleString()}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-white/60 hover:text-white/80 disabled:animate-spin transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M23 4v6h-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.49 15a9 9 0 11-2.12-9.36L23 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
              <p className="text-white/50 text-sm">≈ {user.balances.stablecoin} USDC</p>
            </div>
            
            <div className="text-right">
              <p className="text-white/70 text-sm mb-1">Crédito Disponível</p>
              <p className="text-emerald-400 text-2xl font-bold">R$ 2,500</p>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs mt-1">
                Pré-aprovado
              </Badge>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-5 gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowSendModal(true)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl shadow-lg border-0 flex flex-col items-center justify-center space-y-1"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs leading-tight">Enviar</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowReceiveModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-2xl shadow-lg border-0 flex flex-col items-center justify-center space-y-1"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-xs leading-tight">Receber</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowDepositModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl shadow-lg border-0 flex flex-col items-center justify-center space-y-1"
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs leading-tight">Depositar</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentScreen('credit-request')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-2xl shadow-lg border-0 flex flex-col items-center justify-center space-y-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs leading-tight">Crédito</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentScreen('loans-management')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-2xl shadow-lg border-0 flex flex-col items-center justify-center space-y-1"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-xs leading-tight">Meus Empréstimos</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overdue Alert */}
        {overdueLoan && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mb-4"
          >
            <Card className="border-destructive bg-destructive/5 p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-destructive mb-1">Payment Overdue</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your loan payment of R$ {overdueLoan.amount} is overdue. 
                    Pay now to avoid additional fees.
                  </p>
                  <Button size="sm" variant="destructive">
                    Pay Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>Active Loans</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentScreen('loans-management')}
              className="text-[#007AFF]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {activeLoans.length > 0 ? (
            <div className="space-y-3">
              {activeLoans.slice(0, 2).map((loan) => (
                <Card key={loan.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#007AFF]" />
                      </div>
                      <div>
                        <p className="text-sm">Loan #{loan.id.slice(-4)}</p>
                        <p className="text-lg">R$ {loan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={loan.status === 'overdue' ? 'destructive' : 'default'}
                      className={loan.status === 'active' ? 'bg-[#00C853] text-white' : ''}
                    >
                      {loan.status === 'overdue' ? 'Overdue' : 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span>{loan.interestRate}% APR</span>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#007AFF] hover:bg-[#0056CC]"
                    onClick={() => {
                      // Simulate payment
                      toast.success('Payment processed successfully');
                    }}
                  >
                    Pay Installment
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="mb-2">No Active Loans</h4>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any active loans at the moment.
              </p>
              <Button 
                onClick={() => setCurrentScreen('credit-request')}
                className="bg-[#007AFF] hover:bg-[#0056CC]"
              >
                Request Credit
              </Button>
            </Card>
          )}
        </div>



        {/* Quick Actions */}
        <div>
          <h3 className="mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentScreen('currency-swap')}
            >
              <ArrowLeftRight className="w-6 h-6" />
              <span className="text-sm">Swap Currencies</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentScreen('portfolio')}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">View Portfolio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PIXSendMethodsModal 
        isOpen={showSendModal} 
        onClose={() => setShowSendModal(false)} 
      />
      <PIXReceiveMethodsModal 
        isOpen={showReceiveModal} 
        onClose={() => setShowReceiveModal(false)} 
      />
      <InvestorDepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
    </div>
  );
};