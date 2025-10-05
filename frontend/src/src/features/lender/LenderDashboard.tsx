import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Star, 
  Plus,
  Send,
  BarChart3,
  Target,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useWallet } from '../../shared/hooks/useWallet';
import { usePortfolio } from '../../shared/hooks/usePortfolio';
import { BottomNavigation } from '../../shared/components/ui/BottomNavigation';
import { DepositFlow } from './deposit/DepositFlow';
import { WithdrawFlow } from './withdraw/WithdrawFlow';
import { OpportunityAnalysis } from './invest/OpportunityAnalysis';
import { PoolCreationFlow } from './pool/PoolCreationFlow';
import { PoolManagementFlow } from './pool/PoolManagementFlow';
import { toast } from 'sonner@2.0.3';

type DashboardView = 'main' | 'deposit' | 'withdraw' | 'invest' | 'create-pool' | 'marketplace' | 'manage-pool' | 'opportunities' | 'analyze-opportunity';

export const LenderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { balance: walletBalance, availableBalance, investedBalance, getTotalBalanceInBRL, refreshBalance } = useWallet();
  
  // Conversão USDC <-> BRL (1 USDC = R$ 5,15)
  const USDC_TO_BRL = parseFloat(import.meta.env.VITE_USDC_TO_BRL_RATE || '5.15');
  const BRL_TO_USDC = 1 / USDC_TO_BRL;
  
  // Função helper para converter BRL para USDC
  const convertBRLToUSDC = (brl: number): number => {
    return brl * BRL_TO_USDC;
  };
  
  // TODO: Substituir por ID do contexto do usuário quando implementado
  const INVESTOR_ID = 'i1000000-0000-0000-0000-000000000001'; // Carlos Investidor - investor com dados de teste
  
  // Hook do portfólio com cache no localStorage
  const {
    portfolioData,
    isLoading: portfolioLoading,
    error: portfolioError,
    refresh: refreshPortfolio,
    balance,
    pools,
    directInvestments,
    opportunities,
    performance
  } = usePortfolio(INVESTOR_ID);
  
  const [currentView, setCurrentView] = useState<DashboardView>('main');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realOpportunities, setRealOpportunities] = useState<any[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);

  const [investAmount, setInvestAmount] = useState('');
  
  // Carregar saldo ao montar o componente
  useEffect(() => {
    refreshBalance();
  }, []);
  
  // Recarregar dados quando voltar para a view principal
  useEffect(() => {
    if (currentView === 'main' && !portfolioLoading) {
      refreshPortfolio();
      refreshBalance(); // Atualizar saldo também
    }
  }, [currentView]);
  
  // Atualizar saldo quando entrar na tela de withdraw
  useEffect(() => {
    if (currentView === 'withdraw') {
      refreshBalance();
    }
  }, [currentView]);
  
  // Buscar oportunidades reais quando entrar na tela de opportunities
  useEffect(() => {
    if (currentView === 'opportunities') {
      fetchRealOpportunities();
    }
  }, [currentView]);
  
  const fetchRealOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/credit/opportunities`);
      if (response.ok) {
        const data = await response.json();
        setRealOpportunities(data);
        console.log('[LenderDashboard] Oportunidades carregadas:', data);
      } else {
        console.error('[LenderDashboard] Erro ao buscar oportunidades:', response.status);
        toast.error('Erro ao carregar oportunidades');
      }
    } catch (err) {
      console.error('[LenderDashboard] Erro ao buscar oportunidades:', err);
      toast.error('Erro ao conectar com servidor');
    } finally {
      setIsLoadingOpportunities(false);
    }
  };
  
  // Handler para refresh manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('Atualizando dados do portfólio...');
    
    try {
      await refreshPortfolio();
      toast.success('Portfólio atualizado!');
    } catch (err) {
      toast.error('Erro ao atualizar portfólio');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calcular totais (converter BRL para USDC para exibição)
  const totalBRL = availableBalance.brl + investedBalance.brl;
  const totalUSDC = convertBRLToUSDC(totalBRL);
  const availableUSDC = convertBRLToUSDC(availableBalance.brl);
  const investedUSDC = convertBRLToUSDC(investedBalance.brl);
  const availableBRL = availableBalance.brl;
  const investedBRL = investedBalance.brl;

  // Filter opportunities based on selected filters
  // Usar oportunidades reais da API se disponíveis, senão usar mock do portfolio
  const opportunitiesToShow = realOpportunities.length > 0 ? realOpportunities : opportunities;
  
  const filteredOpportunities = opportunitiesToShow.filter((opportunity: any) => {
    const matchesRisk = !riskFilter || opportunity.risk_level === riskFilter;
    return matchesRisk;
  });





  const handleAnalyzeOpportunity = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setCurrentView('analyze-opportunity');
  };

  const handleInvest = (opportunity: any) => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      toast.error('Digite um valor válido para investimento');
      return;
    }
    
    if (parseFloat(investAmount) > availableUSDC) {
      toast.error('Saldo insuficiente');
      return;
    }
    
    toast.success(`Investimento de ${parseFloat(investAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC realizado em ${opportunity.borrower}!`);
    setInvestAmount('');
    setCurrentView('main');
  };



  if (currentView === 'deposit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DepositFlow
          onBack={() => setCurrentView('main')}
          onComplete={() => setCurrentView('main')}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'withdraw') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <WithdrawFlow
          onBack={() => setCurrentView('main')}
          onComplete={() => setCurrentView('main')}
          availableBalance={availableBalance}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'analyze-opportunity' && selectedOpportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <OpportunityAnalysis
          opportunity={selectedOpportunity}
          onBack={() => setCurrentView('opportunities')}
          onInvest={(amount) => {
            toast.success(`Investimento de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado em ${selectedOpportunity.borrower_name || selectedOpportunity.borrower}!`);
            setCurrentView('main');
          }}
          availableBalance={availableUSDC}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab="opportunities"
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'create-pool') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <PoolCreationFlow
          onBack={() => setCurrentView('main')}
          onComplete={() => setCurrentView('main')}
          availableBalance={getTotalBalanceInBRL()}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab="main"
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'manage-pool') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <PoolManagementFlow
          onBack={() => setCurrentView('main')}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab="main"
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'opportunities') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView('main')}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Oportunidades de Investimento</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-4 w-fit ml-auto bg-[rgba(28,28,28,0.1)]">
            <div className="flex flex-wrap justify-center gap-3">
              <div className="min-w-[140px]">
                <select 
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-gray-800/50 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                >
                  <option value="">Todos os tipos</option>
                  <option value="clt">CLT</option>
                  <option value="autonomo">Autônomo</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
              <div className="min-w-[140px]">
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-gray-800/50 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                >
                  <option value="">Todos os riscos</option>
                  <option value="low">Baixo risco</option>
                  <option value="medium">Médio risco</option>
                  <option value="high">Alto risco</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.credit_request_id || opportunity.id} className="backdrop-blur-md bg-white/10 border-white/20 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(opportunity.borrower_name || opportunity.borrower || 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{opportunity.borrower_name || opportunity.borrower}</h3>
                        <p className="text-gray-400 text-sm">{opportunity.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={
                      opportunity.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                      opportunity.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }
                  >
                    {opportunity.risk_level === 'low' ? 'Baixo Risco' :
                     opportunity.risk_level === 'medium' ? 'Médio Risco' : 'Alto Risco'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Valor</p>
                    <p className="text-white font-semibold">
                      R$ {opportunity.amount.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Taxa</p>
                    <p className="text-green-400 font-semibold">{(opportunity.interest_rate || opportunity.rate || 0)}% a.a.</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Prazo</p>
                    <p className="text-white font-semibold">{(opportunity.duration_months || opportunity.term || 0)} meses</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Score</p>
                    <p className="text-blue-400 font-semibold">{opportunity.score || 0}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleAnalyzeOpportunity(opportunity)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Analisar Oportunidade
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  if (currentView === 'marketplace') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView('main')}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Marketplace de Pools</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Explore Pools de Investimento</h3>
            <p className="text-gray-400 text-sm mb-4">
              Encontre pools compatíveis com seu perfil de investimento
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            >
              Em breve
            </Button>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          userType="lender"
          activeTab={currentView}
          onTabChange={setCurrentView}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fazer logout?</h3>
              <p className="text-gray-400 mb-6">
                Você será redirecionado para a tela de login.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-[rgba(61,61,61,1)]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Limpar localStorage
                    localStorage.removeItem('portfolio_data');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    
                    logout();
                    setShowLogoutModal(false);
                    toast.success('Logout realizado com sucesso!');
                    
                    // Redirecionar para landing page
                    window.location.href = '/';
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">
                Olá, {user?.name?.split(' ')[0]}! 👋
              </h1>

            </div>
            <p className="text-gray-400">Dashboard de investimentos</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-600 hover:border-blue-500 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-600 hover:border-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Portfolio Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Patrimônio Total</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">
                  R$ {totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-300 text-lg">
                  {totalUSDC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Disponível</p>
                  <p className="text-green-400 font-semibold">
                    R$ {availableBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {availableUSDC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Investido</p>
                  <p className="text-blue-400 font-semibold">
                    R$ {investedBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {investedUSDC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                  onClick={() => setCurrentView('deposit')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Receber
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-600 bg-transparent text-white hover:bg-gray-700 hover:text-white text-xs md:text-sm"
                  onClick={() => setCurrentView('withdraw')}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm"
                  onClick={() => setCurrentView('opportunities')}
                >
                  <Target className="w-4 h-4 mr-1" />
                  Investir
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm"
                  onClick={() => setCurrentView('create-pool')}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Criar Pool
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Performance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Performance</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {portfolioLoading ? '...' : `+${((performance.total_received / performance.total_invested) * 100 || 0).toFixed(1)}%`}
                </p>
                <p className="text-gray-400 text-sm">Rendimento (12m)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {portfolioLoading ? '...' : (performance?.active_loans || 0)}
                </p>
                <p className="text-gray-400 text-sm">Ativos Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {portfolioLoading ? '...' : `${(performance?.average_rate || 0).toFixed(1)}%`}
                </p>
                <p className="text-gray-400 text-sm">Taxa Média</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* My Pools */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Minhas Pools</h2>
              </div>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setCurrentView('create-pool')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Pool
              </Button>
            </div>
            
            <div className="space-y-3">
              {portfolioLoading ? (
                <div className="text-center py-4 text-gray-400">
                  Carregando pools...
                </div>
              ) : pools.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  Você ainda não possui pools
                </div>
              ) : (
                pools.map((pool) => (
                  <div 
                    key={pool.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{pool.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {pool.totalCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC de capital
                        </p>
                      </div>
                      <Badge 
                        className={pool.status === 'active' ? 'bg-green-500/20 text-green-400' : pool.status === 'funding' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}
                      >
                        {pool.status === 'active' ? 'Ativa' : pool.status === 'funding' ? 'Captando' : 'Encerrada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-400">Alocado</p>
                        <p className="text-white">
                          {pool.allocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC ({Math.round(pool.allocated / pool.totalCapital * 100)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Empréstimos</p>
                        <p className="text-white">{pool.loans}/{pool.maxLoans}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-semibold">
                        +{pool.averageReturn.toFixed(1)}% a.a.
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-600 text-white bg-transparent hover:bg-blue-600/10"
                        onClick={() => setCurrentView('manage-pool')}
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Direct Investments */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Investimentos Diretos</h2>
              </div>

            </div>
            
            <div className="space-y-3">
              {portfolioLoading ? (
                <div className="text-center py-4 text-gray-400">
                  Carregando investimentos...
                </div>
              ) : directInvestments.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  Você ainda não possui investimentos diretos
                </div>
              ) : (
                directInvestments.map((investment) => (
                  <div 
                    key={investment.id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {investment.borrower.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{investment.borrower}</p>
                        <p className="text-gray-400 text-xs">
                          {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDC • {investment.return.toFixed(1)}% a.a.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/20 text-green-400 mb-1">
                        {investment.status === 'active' ? 'Ativo' : investment.status}
                      </Badge>
                      {investment.nextPayment && (
                        <p className="text-gray-400 text-xs">
                          Próximo: {new Date(investment.nextPayment).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Opportunities */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >

        </motion.div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        userType="lender"
        activeTab={currentView}
        onTabChange={setCurrentView}
      />
    </div>
    </>
  );
};