import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { 
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  Clock,
  Target
} from 'lucide-react';

export const LenderHome: React.FC = () => {
  const { 
    user, 
    creditRequests, 
    investmentPools, 
    transactions,
    portfolioStats,
    setCurrentScreen,
    updateCreditRequestStatus,
    addLoan
  } = useApp();
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Multi-currency state
  const [currencies] = useState([
    {
      code: 'BRL',
      name: 'Real Brasileiro',
      symbol: 'R$',
      balance: 2500.00,
      rate: 1,
      color: '#059669',
      type: 'fiat'
    },
    {
      code: 'USDT',
      name: 'Tether USD',
      symbol: '₮',
      balance: 1000.00,
      rate: 5.2,
      color: '#26A17B',
      type: 'crypto'
    },
    {
      code: 'USDC',
      name: 'USD Coin',
      symbol: '$',
      balance: user?.balances?.stablecoin || 0,
      rate: 5.2,
      color: '#2775CA',
      type: 'crypto'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      balance: 450.00,
      rate: 5.8,
      color: '#1E40AF',
      type: 'fiat'
    }
  ]);

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[2]); // Default to USDC

  if (!user) return null;

  const pendingRequests = creditRequests.filter(req => req.status === 'pending');
  const myPools = investmentPools.filter(pool => pool.lenderId === user.id);
  const recentTransactions = transactions.slice(0, 3);

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const request = creditRequests.find(r => r.id === requestId);
      if (request) {
        // Create a new loan
        addLoan({
          id: Math.random().toString(36).substr(2, 9),
          amount: request.amount,
          currency: request.currency,
          interestRate: 15,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          borrowerId: request.borrowerId,
          lenderId: user.id,
          installments: 12,
          paidInstallments: 0
        });
        
        updateCreditRequestStatus(requestId, 'approved');
        toast.success('Credit request approved successfully!');
      }
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateCreditRequestStatus(requestId, 'rejected');
      toast.success('Credit request rejected');
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div className="min-h-screen swapin-gradient pb-20">
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
              <p className="text-white/70 text-sm">Bem-vindo de volta</p>
              <h1 className="text-white text-2xl font-bold">{user.name.split(' ')[0]}</h1>
            </div>
          </div>
          
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

        {/* Portfolio Overview */}
        <div className="swapin-glass p-8 rounded-3xl backdrop-blur-xl relative z-10">
          {/* Currency Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex -space-x-2">
              {currencies.map((currency, index) => (
                <motion.button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    selectedCurrency.code === currency.code
                      ? 'border-emerald-400 scale-110 z-10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ 
                    backgroundColor: currency.color,
                    zIndex: currencies.length - index 
                  }}
                  whileHover={{ scale: selectedCurrency.code === currency.code ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-xs font-bold">
                    {currency.symbol}
                  </span>
                </motion.button>
              ))}
            </div>
            
            <Button
              onClick={() => setCurrentScreen('currency-swap')}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 p-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-90">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          {/* Balance Display */}
          <motion.div 
            key={selectedCurrency.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-baseline space-x-2 mb-2">
              <p className="text-white/70 text-sm font-medium">Saldo em {selectedCurrency.name}</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${selectedCurrency.type === 'crypto' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                <span className="text-white/50 text-xs uppercase">{selectedCurrency.type}</span>
              </div>
            </div>
            
            <h2 className="text-white text-3xl font-bold">
              {selectedCurrency.balance.toLocaleString()} {selectedCurrency.code}
            </h2>
            
            {selectedCurrency.code !== 'BRL' && (
              <p className="text-white/60 text-sm mt-1">
                ≈ R$ {(selectedCurrency.balance * selectedCurrency.rate).toLocaleString()}
              </p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => setCurrentScreen('deposit')}
              className="bg-emerald-500 text-white hover:bg-emerald-600 flex-col h-auto py-3"
            >
              <Plus className="w-4 h-4 mb-1" />
              <span className="text-xs">Depositar</span>
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('currency-swap')}
              className="bg-blue-500 text-white hover:bg-blue-600 flex-col h-auto py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mb-1">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs">Trocar</span>
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('create-pool')}
              className="bg-purple-500 text-white hover:bg-purple-600 flex-col h-auto py-3"
            >
              <Target className="w-4 h-4 mb-1" />
              <span className="text-xs">Pool</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Pending Credit Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>Credit Requests</h3>
              <p className="text-sm text-muted-foreground">
                {pendingRequests.length} pending review
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentScreen('all-requests')}
              className="text-[#007AFF]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Request #{request.id.slice(-4)}
                        </p>
                        <p className="text-lg">R$ {request.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.duration} months
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className={`${
                          request.riskScore >= 800 ? 'border-[#00C853] text-[#00C853]' :
                          request.riskScore >= 600 ? 'border-[#FFD700] text-[#FFD700]' :
                          'border-[#FF5722] text-[#FF5722]'
                        }`}
                      >
                        Risk: {request.riskScore}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="flex-1 bg-[#00C853] hover:bg-[#00A844] text-white"
                    >
                      {processingRequest === request.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="mb-2">No pending requests</h4>
              <p className="text-sm text-muted-foreground">
                New credit requests will appear here for your review
              </p>
            </Card>
          )}
        </div>

        {/* Investment Pools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>My Investment Pools</h3>
              <p className="text-sm text-muted-foreground">
                {myPools.length} active pools
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentScreen('my-pools')}
              className="text-[#007AFF]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {myPools.length > 0 ? (
            <div className="space-y-3">
              {myPools.slice(0, 2).map((pool) => (
                <Card key={pool.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#007AFF]" />
                      </div>
                      <div>
                        <p className="text-sm">Pool #{pool.id.slice(-4)}</p>
                        <p className="text-lg">R$ {pool.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className={pool.status === 'active' ? 'border-[#00C853] text-[#00C853]' : ''}
                    >
                      {pool.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{pool.fractions} fractions</span>
                    <span>Risk: {pool.minRiskScore}-{pool.maxRiskScore}</span>
                    <span>{pool.interestRate}% APR</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="mb-2">No investment pools</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first pool to start lending and earning returns
              </p>
              <Button 
                onClick={() => setCurrentScreen('create-pool')}
                className="bg-[#00C853] hover:bg-[#00A844]"
              >
                Create Pool
              </Button>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>Recent Activity</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentScreen('transactions-history')}
              className="text-[#007AFF]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'receive' ? 'bg-[#00C853]/10' : 'bg-[#007AFF]/10'
                      }`}>
                        <ArrowRight className={`w-5 h-5 ${
                          transaction.type === 'receive' 
                            ? 'text-[#00C853] rotate-180' 
                            : 'text-[#007AFF]'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm capitalize">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`${
                        transaction.type === 'receive' ? 'text-[#00C853]' : 'text-foreground'
                      }`}>
                        {transaction.type === 'receive' ? '+' : ''}R$ {transaction.amount.toLocaleString()}
                      </p>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className={transaction.status === 'completed' ? 'bg-[#00C853] text-white' : ''}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="mb-2">No recent activity</h4>
              <p className="text-sm text-muted-foreground">
                Your transactions and investments will appear here
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};