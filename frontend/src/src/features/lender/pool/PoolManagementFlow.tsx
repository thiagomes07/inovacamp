import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Slider } from '../../../../components/ui/slider';
import { Progress } from '../../../../components/ui/progress';
import { Separator } from '../../../../components/ui/separator';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Users,
  Target,
  Shield,
  Clock,
  Edit3,
  Pause,
  Play,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  Car,
  Home,
  Settings,
  Eye,
  Briefcase,
  Star
} from 'lucide-react';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';
import { usePool, Pool as PoolType } from '../../../shared/hooks/usePool';
import { useAuth } from '../../../shared/hooks/useAuth';

interface PoolManagementFlowProps {
  onBack: () => void;
}

interface Pool {
  id: string;
  name: string;
  status: 'active' | 'funding' | 'closed';
  totalAmount: number;
  allocatedAmount: number;
  availableAmount: number;
  totalLoans: number;
  filledLoans: number;
  performance: {
    accumulatedReturn: number;
    averageRate: number;
    onTimePayments: number;
  };
  criteria: {
    minScore: number;
    requireCollateral: boolean;
    minReturn: number;
    maxTerm: number;
  };
}

interface Loan {
  id: string;
  poolId: string;
  borrowerType: string;
  borrowerProfession: string;
  score: number;
  amount: number;
  term: number;
  rate: number;
  collateral: {
    type: 'vehicle' | 'property' | 'equipment';
    description: string;
  } | null;
  status: 'active' | 'completed' | 'overdue';
  paidInstallments: number;
  totalInstallments: number;
  nextPaymentDate: string;
}

type ViewMode = 'list' | 'details' | 'edit';

const getNumericValue = (maskedValue: string): number => {
  return parseFloat(maskedValue.replace(/[R$\.\s]/g, '').replace(',', '.')) || 0;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Mock data
const mockPools: Pool[] = [
  {
    id: 'pool-1',
    name: 'Diversificação Brasil',
    status: 'active',
    totalAmount: 50000,
    allocatedAmount: 35000,
    availableAmount: 15000,
    totalLoans: 10,
    filledLoans: 7,
    performance: {
      accumulatedReturn: 2450,
      averageRate: 19.2,
      onTimePayments: 100
    },
    criteria: {
      minScore: 700,
      requireCollateral: true,
      minReturn: 18,
      maxTerm: 12
    }
  },
  {
    id: 'pool-2',
    name: 'Score Alto 2025',
    status: 'active',
    totalAmount: 100000,
    allocatedAmount: 80000,
    availableAmount: 20000,
    totalLoans: 20,
    filledLoans: 16,
    performance: {
      accumulatedReturn: 5800,
      averageRate: 17.5,
      onTimePayments: 95
    },
    criteria: {
      minScore: 800,
      requireCollateral: false,
      minReturn: 16,
      maxTerm: 18
    }
  }
];

const mockLoans: Loan[] = [
  {
    id: 'loan-0042',
    poolId: 'pool-1',
    borrowerType: 'CLT',
    borrowerProfession: 'Engenheiro',
    score: 820,
    amount: 5000,
    term: 12,
    rate: 20,
    collateral: {
      type: 'vehicle',
      description: 'Honda Civic 2020'
    },
    status: 'active',
    paidInstallments: 3,
    totalInstallments: 12,
    nextPaymentDate: '2025-11-05'
  },
  {
    id: 'loan-0043',
    poolId: 'pool-1',
    borrowerType: 'MEI',
    borrowerProfession: 'Designer',
    score: 750,
    amount: 5000,
    term: 12,
    rate: 18.5,
    collateral: {
      type: 'equipment',
      description: 'MacBook Pro 2022'
    },
    status: 'active',
    paidInstallments: 5,
    totalInstallments: 12,
    nextPaymentDate: '2025-11-10'
  },
  {
    id: 'loan-0044',
    poolId: 'pool-1',
    borrowerType: 'CLT',
    borrowerProfession: 'Desenvolvedor',
    score: 780,
    amount: 5000,
    term: 12,
    rate: 19,
    collateral: {
      type: 'property',
      description: 'Apartamento - Centro'
    },
    status: 'active',
    paidInstallments: 2,
    totalInstallments: 12,
    nextPaymentDate: '2025-11-15'
  }
];

export const PoolManagementFlow: React.FC<PoolManagementFlowProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { pools: poolsFromHook, isLoading, pausePool, resumePool, updatePool } = usePool();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPool, setSelectedPool] = useState<PoolType | null>(null);
  const [editingPool, setEditingPool] = useState<PoolType | null>(null);

  // Mapeia os pools do backend para o formato esperado pelo componente
  const pools = poolsFromHook.map(pool => ({
    id: pool.id,
    name: pool.name,
    status: pool.status as 'active' | 'funding' | 'closed',
    totalAmount: pool.totalCapital,
    allocatedAmount: pool.allocatedAmount || 0,
    availableAmount: pool.availableAmount || pool.totalCapital - (pool.allocatedAmount || 0),
    totalLoans: pool.currentLoansCount || 0,
    filledLoans: pool.currentLoansCount || 0,
    performance: {
      accumulatedReturn: 0,
      averageRate: pool.averageReturn || pool.expectedReturn || 0,
      onTimePayments: 100
    },
    criteria: {
      minScore: 700,
      requireCollateral: true,
      minReturn: pool.expectedReturn || 0,
      maxTerm: pool.durationMonths || 12
    }
  }));

  const getStatusColor = (status: Pool['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'funding': return 'text-yellow-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Pool['status']) => {
    switch (status) {
      case 'active': return '🟢';
      case 'funding': return '🟡';
      case 'closed': return '🔴';
      default: return '⚪';
    }
  };

  const getCollateralIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Car className="w-4 h-4" />;
      case 'property': return <Home className="w-4 h-4" />;
      case 'equipment': return <Settings className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const handlePoolAction = async (action: 'pause' | 'resume' | 'delete', poolId: string) => {
    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) return;

      switch (action) {
        case 'pause':
          await pausePool(poolId);
          toast.success(`Pool "${pool.name}" pausada com sucesso!`);
          break;
        case 'resume':
          await resumePool(poolId);
          toast.success(`Pool "${pool.name}" reativada com sucesso!`);
          break;
        case 'delete':
          // Close pool via status update
          await updatePool(poolId, { status: 'closed' });
          toast.success(`Pool "${pool.name}" encerrada com sucesso!`);
          break;
      }
    } catch (error) {
      toast.error('Erro ao atualizar pool');
      console.error(error);
    }
  };

  const handleEditPool = (pool: any) => {
    // Find the original pool from hook to get full data
    const originalPool = poolsFromHook.find(p => p.id === pool.id);
    if (originalPool) {
      setEditingPool(originalPool);
      setViewMode('edit');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPool) return;
    
    // Validações obrigatórias
    if (!editingPool.expectedReturn || editingPool.expectedReturn <= 0) {
      toast.error('O retorno esperado deve ser maior que zero');
      return;
    }
    
    if (!editingPool.durationMonths || editingPool.durationMonths <= 0) {
      toast.error('A duração deve ser maior que zero');
      return;
    }
    
    if (!editingPool.totalCapital || editingPool.totalCapital < 1000) {
      toast.error('O capital total deve ser no mínimo R$ 1.000');
      return;
    }
    
    try {
      // Prepara dados com mapeamento correto para backend (snake_case)
      const updateData: any = {
        name: editingPool.name,
        expected_return: editingPool.expectedReturn,
        duration_months: editingPool.durationMonths,
        target_amount: editingPool.totalCapital
      };

      // Adiciona critérios se existirem
      if (editingPool.criteria) {
        updateData.min_score = editingPool.criteria.minScore;
        updateData.requires_collateral = editingPool.criteria.requiresCollateral;
        updateData.min_interest_rate = editingPool.criteria.minInterestRate;
        updateData.max_term_months = editingPool.criteria.maxTermMonths;
      }
      
      await updatePool(editingPool.id, updateData);
      
      toast.success(`Pool "${editingPool.name}" atualizada com sucesso!`);
      setViewMode('list');
      setEditingPool(null);
    } catch (error) {
      toast.error('Erro ao atualizar pool');
      console.error(error);
    }
  };

  const renderPoolList = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Suas Pools de Investimento</h2>
        <p className="text-gray-400">Gerencie e monitore suas pools ativas</p>
      </div>

      <div className="space-y-4">
        {pools.map((pool) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border-gray-600 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                {/* Header - Two Groups Layout */}
                <div className="flex justify-between items-center gap-4">
                  {/* Left Group: Icon + Title + Status */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{pool.name}</h3>
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm text-gray-400">Status:</span>
                        <span className={`text-xs sm:text-sm font-medium ${getStatusColor(pool.status)} flex items-center gap-1`}>
                          {getStatusIcon(pool.status)} {pool.status === 'active' ? 'Ativa' : pool.status === 'funding' ? 'Financiando' : 'Finalizada'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Group: Total Amount */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">
                      {formatCurrency(pool.totalAmount)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">total</p>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                {/* Allocation Status - Responsive Flex with Wrap */}
                <div>
                  <h4 className="text-base font-semibold text-white mb-3">Alocação</h4>
                  <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-blue-400">
                        {formatCurrency(pool.allocatedAmount)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Alocados ({Math.round((pool.allocatedAmount / pool.totalAmount) * 100)}%)</p>
                    </div>
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-yellow-400">
                        {formatCurrency(pool.availableAmount)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Aguardando alocação</p>
                    </div>
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-purple-400">
                        {pool.filledLoans}/{pool.totalLoans}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">empréstimos preenchidos</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar - Space Between Layout */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Progresso de alocação</span>
                    <span className="text-sm font-medium text-white">{Math.round((pool.allocatedAmount / pool.totalAmount) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(pool.allocatedAmount / pool.totalAmount) * 100} 
                    className="h-3 bg-gray-700/50 [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-blue-400" 
                  />
                </div>

                <Separator className="bg-gray-600" />

                {/* Performance - Responsive Flex with Wrap */}
                <div>
                  <h4 className="text-base font-semibold text-white mb-3">Performance e Lucro</h4>
                  <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-green-400">
                        {formatCurrency(pool.performance.accumulatedReturn)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Retorno real acumulado</p>
                    </div>
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-blue-400">
                        {pool.performance.averageRate.toFixed(1)}% a.a.
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Taxa efetiva (com alocação atual)</p>
                    </div>
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-green-500">
                        {formatCurrency(Math.abs(pool.allocatedAmount * (pool.performance.averageRate / 100) * (pool.criteria.maxTerm / 12)))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Lucro projetado ({pool.criteria.maxTerm}m)</p>
                    </div>
                    <div className="text-center min-w-[120px] flex-1">
                      <div className="text-base sm:text-lg font-semibold text-purple-400">
                        {pool.performance.onTimePayments}%
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">pagamentos em dia</p>
                    </div>
                  </div>
                </div>

                {/* Actions - Consistent Width and Gap */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Find original pool from hook
                      const originalPool = poolsFromHook.find(p => p.id === pool.id);
                      if (originalPool) {
                        setSelectedPool(originalPool);
                        setViewMode('details');
                      }
                    }}
                    className="w-full sm:flex-1 border-blue-600 text-[rgba(179,221,255,1)] hover:bg-blue-600/10 bg-[rgba(255,255,255,0.08)]"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Empréstimos
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPool(pool)}
                    className="w-full sm:flex-1 border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 bg-[rgba(255,255,255,0.08)]"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Critérios
                  </Button>
                  
                  {pool.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePoolAction('pause', pool.id)}
                      className="w-full sm:flex-1 border-orange-600 text-orange-400 hover:bg-orange-600/10 bg-[rgba(255,255,255,0.12)]"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar Pool
                    </Button>
                  ) : pool.status === 'paused' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePoolAction('resume', pool.id)}
                      className="w-full sm:flex-1 border-green-600 text-green-400 hover:bg-green-600/10"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Reativar
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPoolDetails = () => {
    if (!selectedPool) return null;

    const poolLoans = selectedPool.loans || mockLoans.filter(loan => loan.poolId === selectedPool.id);
    const currentLoansCount = selectedPool.currentLoansCount || 0;
    const maxLoansCount = selectedPool.maxLoansCount || 10;
    const remainingSlots = maxLoansCount - currentLoansCount;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-white">{selectedPool.name}</h2>
            <p className="text-gray-400">Detalhes dos empréstimos</p>
          </div>
        </div>

        {/* Pool Summary */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-gray-600 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(selectedPool.totalCapital)}
              </div>
              <p className="text-sm text-gray-400">Capital Total</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(selectedPool.allocatedAmount || 0)}
              </div>
              <p className="text-sm text-gray-400">Alocado</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">
                {currentLoansCount}/{maxLoansCount}
              </div>
              <p className="text-sm text-gray-400">Empréstimos</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">
                {(selectedPool.averageReturn || selectedPool.expectedReturn || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-400">Taxa Média</p>
            </div>
          </div>
        </Card>

        {/* Active Loans */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Empréstimos Ativos ({poolLoans.length})</h3>
          <div className="space-y-4">
            {poolLoans.map((loan) => (
              <Card key={loan.id} className="bg-slate-800/50 backdrop-blur-md border-gray-600 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Empréstimo #{loan.id.slice(-4)}</h4>
                        <p className="text-sm text-gray-400">
                          {'borrowerType' in loan ? `${loan.borrowerType} - ${loan.borrowerProfession}` : 'borrowerName' in loan ? loan.borrowerName : 'Tomador'} (Score: {loan.score})
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {formatCurrency(loan.amount)}
                      </div>
                      <p className="text-sm text-gray-400">
                        {'termMonths' in loan ? loan.termMonths : 'term' in loan ? loan.term : 12}x | {'interestRate' in loan ? loan.interestRate : 'rate' in loan ? loan.rate : 0}% a.a.
                      </p>
                    </div>
                  </div>

                  {loan.collateral && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Shield className="w-4 h-4 text-green-400" />
                      <div className="flex items-center gap-2">
                        {getCollateralIcon(loan.collateral.type)}
                        <span className="text-sm text-green-400">
                          Garantia: {loan.collateral.description}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">
                        {'paidInstallments' in loan ? `${loan.paidInstallments}/${loan.totalInstallments}` : '-'}
                      </div>
                      <p className="text-xs text-gray-400">parcelas pagas</p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-400">
                        {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                      <p className="text-xs text-gray-400">próximo pagamento</p>
                    </div>
                    <div className="text-center">
                      <Badge variant={loan.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {loan.status === 'active' ? 'Em dia' : 'Atrasado'}
                      </Badge>
                    </div>
                  </div>

                  {'paidInstallments' in loan && 'totalInstallments' in loan && (
                    <div className="space-y-2 bg-[rgba(0,0,0,0)]">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-white">{Math.round((loan.paidInstallments / loan.totalInstallments) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(loan.paidInstallments / loan.totalInstallments) * 100} 
                        className="h-3 bg-gray-700/50 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-blue-400" 
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        {remainingSlots > 0 && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">
                {remainingSlots} vagas restantes
              </h4>
              <p className="text-sm text-gray-400">
                Aguardando solicitações compatíveis com os critérios da pool
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderEditPool = () => {
    if (!editingPool) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-white">Editar Pool</h2>
            <p className="text-gray-400">{editingPool.name}</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-md border-gray-600 p-6">
          <div className="space-y-6">
            <div>
              <Label className="text-white">Nome da Pool</Label>
              <Input
                value={editingPool.name}
                onChange={(e) => setEditingPool(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="bg-gray-800 border-gray-600 text-white mt-2"
              />
            </div>

            <div>
              <Label className="text-white">Capital Total (R$)</Label>
              <Input
                type="number"
                step="1000"
                min="0"
                value={editingPool.totalCapital ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setEditingPool(prev => prev ? { ...prev, totalCapital: value } : null);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white mt-2"
                placeholder="Ex: 100000"
              />
              <p className="text-xs text-gray-400 mt-1">Capital total disponível para a pool (mínimo R$ 1.000)</p>
            </div>

            <div>
              <Label className="text-white">Retorno Esperado (% a.a.)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={editingPool.expectedReturn ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setEditingPool(prev => prev ? { ...prev, expectedReturn: value } : null);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white mt-2"
                placeholder="Ex: 18.5"
              />
              <p className="text-xs text-gray-400 mt-1">Taxa de retorno anual esperada (0-100%)</p>
            </div>

            <div>
              <Label className="text-white">Duração (meses)</Label>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[6, 12, 18, 24].map((months) => (
                  <Button
                    key={months}
                    type="button"
                    variant={editingPool.durationMonths === months ? "default" : "outline"}
                    onClick={() => setEditingPool(prev => prev ? { ...prev, durationMonths: months } : null)}
                    className={editingPool.durationMonths === months 
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                      : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  >
                    {months} meses
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Critérios de Elegibilidade</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Score Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    max="850"
                    value={editingPool.criteria?.minScore ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 850) {
                        setEditingPool(prev => {
                          if (!prev) return null;
                          return { 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria,
                              minScore: value,
                              requiresCollateral: prev.criteria?.requiresCollateral ?? false,
                              collateralTypes: prev.criteria?.collateralTypes ?? [],
                              minInterestRate: prev.criteria?.minInterestRate ?? 0,
                              maxTermMonths: prev.criteria?.maxTermMonths ?? 24
                            } 
                          };
                        });
                      }
                    }}
                    className="bg-gray-800 border-gray-600 text-white mt-2"
                    placeholder="Ex: 700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Score de crédito mínimo exigido (0-850, 0 = sem mínimo)</p>
                </div>

                <div>
                  <Label className="text-white">Prazo Máximo (meses)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={editingPool.criteria?.maxTermMonths ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 60) {
                        setEditingPool(prev => {
                          if (!prev) return null;
                          return { 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria,
                              minScore: prev.criteria?.minScore ?? 700,
                              requiresCollateral: prev.criteria?.requiresCollateral ?? false,
                              collateralTypes: prev.criteria?.collateralTypes ?? [],
                              minInterestRate: prev.criteria?.minInterestRate ?? 0,
                              maxTermMonths: value
                            } 
                          };
                        });
                      }
                    }}
                    className="bg-gray-800 border-gray-600 text-white mt-2"
                    placeholder="Ex: 24"
                  />
                  <p className="text-xs text-gray-400 mt-1">Prazo máximo aceito (0-60 meses, 0 = sem limite)</p>
                </div>

                <div>
                  <Label className="text-white">Taxa Mínima (% a.a.)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingPool.criteria?.minInterestRate ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 100) {
                        setEditingPool(prev => {
                          if (!prev) return null;
                          return { 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria,
                              minScore: prev.criteria?.minScore ?? 700,
                              requiresCollateral: prev.criteria?.requiresCollateral ?? false,
                              collateralTypes: prev.criteria?.collateralTypes ?? [],
                              minInterestRate: value,
                              maxTermMonths: prev.criteria?.maxTermMonths ?? 24
                            } 
                          };
                        });
                      }
                    }}
                    className="bg-gray-800 border-gray-600 text-white mt-2"
                    placeholder="Ex: 15.0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Taxa de juros mínima aceita (0% = sem mínimo)</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireCollateral"
                    checked={editingPool.criteria?.requiresCollateral || false}
                    onChange={(e) => {
                      setEditingPool(prev => {
                        if (!prev) return null;
                        return { 
                          ...prev, 
                          criteria: { 
                            ...prev.criteria,
                            minScore: prev.criteria?.minScore ?? 700,
                            requiresCollateral: e.target.checked,
                            collateralTypes: prev.criteria?.collateralTypes ?? [],
                            minInterestRate: prev.criteria?.minInterestRate ?? 0,
                            maxTermMonths: prev.criteria?.maxTermMonths ?? 24
                          } 
                        };
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="requireCollateral" className="text-white cursor-pointer">
                    Exigir garantia (colateral)
                  </Label>
                </div>
              </div>
            </div>

            {/* Cálculo de Lucro Simulado */}
            {editingPool.expectedReturn && editingPool.durationMonths && (
              <Card className="bg-green-500/10 border-green-500/30 p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-400 mb-2">Projeção de Lucro</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">Retorno Total</p>
                        <p className="text-lg font-semibold text-white">
                          {((editingPool.expectedReturn / 100) * (editingPool.durationMonths / 12) * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {editingPool.durationMonths} meses a {editingPool.expectedReturn}% a.a.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Retorno por R$ 10.000</p>
                        <p className="text-lg font-semibold text-green-500">
                          R$ {Math.abs(10000 * (editingPool.expectedReturn / 100) * (editingPool.durationMonths / 12)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Lucro estimado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="bg-blue-500/10 border-blue-500/30 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Informação</h4>
                  <p className="text-sm text-gray-300">
                    As alterações afetarão apenas novos empréstimos alocados a esta pool.
                    Empréstimos já ativos manterão suas condições originais.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setViewMode('list')}
                className="flex-1 border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={
                  !editingPool?.expectedReturn || 
                  editingPool.expectedReturn <= 0 || 
                  !editingPool?.durationMonths || 
                  editingPool.durationMonths <= 0 ||
                  !editingPool?.totalCapital ||
                  editingPool.totalCapital < 1000
                }
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
            
            {/* Aviso de validação */}
            {editingPool && (
              (!editingPool.expectedReturn || editingPool.expectedReturn <= 0 || 
               !editingPool.durationMonths || editingPool.durationMonths <= 0 ||
               !editingPool.totalCapital || editingPool.totalCapital < 1000) && (
                <Card className="bg-red-500/10 border-red-500/30 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-300">
                      <p className="font-medium mb-1">Campos obrigatórios:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-xs">
                        {(!editingPool.expectedReturn || editingPool.expectedReturn <= 0) && (
                          <li>Retorno esperado deve ser maior que 0%</li>
                        )}
                        {(!editingPool.durationMonths || editingPool.durationMonths <= 0) && (
                          <li>Duração deve ser maior que 0 meses</li>
                        )}
                        {(!editingPool.totalCapital || editingPool.totalCapital < 1000) && (
                          <li>Capital total mínimo de R$ 1.000</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-32">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Pools</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'list' && renderPoolList()}
        {viewMode === 'details' && renderPoolDetails()}
        {viewMode === 'edit' && renderEditPool()}
      </div>
    </div>
  );
};