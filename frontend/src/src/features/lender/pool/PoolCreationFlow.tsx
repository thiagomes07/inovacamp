import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Slider } from '../../../../components/ui/slider';
import { Switch } from '../../../../components/ui/switch';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Separator } from '../../../../components/ui/separator';
import { Progress } from '../../../../components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  Target,
  Shield,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';
import { usePool } from '../../../shared/hooks/usePool';

interface PoolCreationFlowProps {
  onBack: () => void;
  onComplete: () => void;
  availableBalance: number;
}

type WizardStep = 1 | 2 | 3 | 4;

interface PoolConfig {
  name: string;
  totalAmount: string;
  loanCount: number;
  minScore: number;
  requireCollateral: boolean;
  acceptedCollaterals: string[];
  minReturn: number;
  maxTerm: number;
}

const getNumericValue = (value: string | number): number => {
  if (!value) return 0;
  
  // Se já for número, retorna direto
  if (typeof value === 'number') return value;
  
  // Remove R$, espaços e pontos (separadores de milhar)
  // Mantém apenas números e vírgula decimal
  const cleanValue = value.replace(/[R$\s\.]/g, '').replace(',', '.');
  const result = parseFloat(cleanValue) || 0;
  
  return result;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const PoolCreationFlow: React.FC<PoolCreationFlowProps> = ({
  onBack,
  onComplete,
  availableBalance
}) => {
  const { createPool, isLoading: poolLoading } = usePool();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showBiometric, setShowBiometric] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [poolConfig, setPoolConfig] = useState<PoolConfig>({
    name: '',
    totalAmount: '',
    loanCount: 10,
    minScore: 700,
    requireCollateral: true,
    acceptedCollaterals: ['vehicle', 'property'],
    minReturn: 18,
    maxTerm: 12
  });

  const collateralOptions = [
    { id: 'vehicle', label: 'Veículo', icon: '🚗' },
    { id: 'property', label: 'Imóvel', icon: '🏠' },
    { id: 'equipment', label: 'Equipamentos', icon: '🔧' },
    { id: 'investment', label: 'Investimentos', icon: '📈' }
  ];

  // Verificação de saldo suficiente
  const totalAmountValue = getNumericValue(poolConfig.totalAmount);
  const hasInsufficientBalance = totalAmountValue > availableBalance;

  // Cálculos dinâmicos
  const maxAmountPerLoan = totalAmountValue > 0 && poolConfig.loanCount > 0 
    ? totalAmountValue / poolConfig.loanCount 
    : 0;

  const estimatedReturn = totalAmountValue * (poolConfig.minReturn / 100);
  const eligibleBorrowers = Math.floor(450 * (1000 - poolConfig.minScore) / 600); // Simulação

  const handleNext = () => {
    if (currentStep === 1) {
      if (!poolConfig.name.trim()) {
        toast.error('Digite um nome para a pool');
        return;
      }
      if (!poolConfig.totalAmount || totalAmountValue < 5000) {
        toast.error('Valor mínimo de R$ 5.000,00');
        return;
      }
      if (hasInsufficientBalance) {
        toast.error('Saldo insuficiente para este valor');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (poolConfig.requireCollateral && poolConfig.acceptedCollaterals.length === 0) {
        toast.error('Selecione pelo menos um tipo de garantia');
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    } else {
      onBack();
    }
  };

  const handleActivatePool = async () => {
    // Se valor > R$ 10.000, solicitar biometria
    if (totalAmountValue > 10000) {
      setShowBiometric(true);
      return;
    }
    
    await createPoolReal();
  };

  const handleBiometricSuccess = async () => {
    setShowBiometric(false);
    await createPoolReal();
  };

  const createPoolReal = async () => {
    setIsCreating(true);
    
    try {
      const collateralTypes = poolConfig.requireCollateral 
        ? poolConfig.acceptedCollaterals.map(c => c.toUpperCase())
        : [];

      await createPool({
        name: poolConfig.name,
        description: `Pool criada em ${new Date().toLocaleDateString('pt-BR')}`,
        totalCapital: totalAmountValue,
        maxLoansCount: poolConfig.loanCount,
        criteria: {
          minScore: poolConfig.minScore,
          requiresCollateral: poolConfig.requireCollateral,
          collateralTypes: collateralTypes,
          minInterestRate: poolConfig.minReturn,
          maxTermMonths: poolConfig.maxTerm,
        },
      });

      toast.success(`Pool "${poolConfig.name}" criada com sucesso!`);
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pool');
      console.error('Erro ao criar pool:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Configurações Básicas</h2>
        <p className="text-gray-400">Defina o nome, valor e distribuição da sua pool</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white">Nome da Pool</Label>
          <Input
            placeholder="Ex: Diversificação Brasil, Score Alto 2025"
            value={poolConfig.name}
            onChange={(e) => setPoolConfig(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white mt-2"
          />
        </div>

        <div>
          <Label className="text-white">Valor Total a Investir</Label>
          <Input
            type="number"
            step="1000"
            min="0"
            placeholder="Digite o valor em reais"
            value={poolConfig.totalAmount}
            onChange={(e) => setPoolConfig(prev => ({ ...prev, totalAmount: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white mt-2"
          />
          {totalAmountValue > 0 && (
            <div className="mt-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-sm text-blue-300">
                ≈ {(totalAmountValue / 5.15).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).replace('US$', 'USDC')}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                (1 USDC = R$ 5,15)
              </span>
            </div>
          )}
          <div className="flex justify-between mt-1">
            <span className={`text-sm ${totalAmountValue > 0 && totalAmountValue < 5000 ? 'text-red-400' : 'text-gray-400'}`}>
              Mínimo: R$ 5.000,00
            </span>
            <span className="text-sm text-green-400 font-semibold">
              Disponível: {formatCurrency(availableBalance)}
            </span>
          </div>
          <div className="mt-2 px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">
              💡 Seu saldo disponível pode incluir BRL e USDC convertido (taxa: R$ 5,15/USDC)
            </p>
          </div>
          {totalAmountValue > 0 && totalAmountValue < 5000 && (
            <p className="text-red-400 text-sm mt-1">
              ⚠️ Valor mínimo de R$ 5.000,00 necessário para criar uma pool
            </p>
          )}
          {hasInsufficientBalance && (
            <p className="text-red-400 text-sm mt-1">
              Saldo insuficiente. <button className="underline" onClick={() => toast.info('Redirecionando para recebimento...')}>Receber mais</button>
            </p>
          )}
        </div>

        <div>
          <Label className="text-white">Dividir em quantos empréstimos?</Label>
          <div className="mt-4">
            <Slider
              value={[poolConfig.loanCount]}
              onValueChange={(value) => setPoolConfig(prev => ({ ...prev, loanCount: value[0] }))}
              min={5}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-400">5</span>
              <span className="text-white font-medium">{poolConfig.loanCount} empréstimos</span>
              <span className="text-sm text-gray-400">100</span>
            </div>
          </div>
          
          {maxAmountPerLoan > 0 && (
            <Card className="bg-blue-500/10 border-blue-500/30 p-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">
                    Cada empréstimo será de: {formatCurrency(maxAmountPerLoan)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 pl-7">
                  O valor total ({formatCurrency(totalAmountValue)}) será dividido em {poolConfig.loanCount} empréstimos de até {formatCurrency(maxAmountPerLoan)} cada.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Critérios de Risco</h2>
        <p className="text-gray-400">Defina o perfil de risco que você aceita</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-white">Score Mínimo Aceito</Label>
          <div className="mt-4">
            <Slider
              value={[poolConfig.minScore]}
              onValueChange={(value) => setPoolConfig(prev => ({ ...prev, minScore: value[0] }))}
              min={400}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-400">400</span>
              <span className="text-white font-medium">{poolConfig.minScore}</span>
              <span className="text-sm text-gray-400">1000</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${
                poolConfig.minScore >= 800 ? 'bg-green-500' :
                poolConfig.minScore >= 600 ? 'bg-yellow-500' :
                poolConfig.minScore >= 400 ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-300">
                {poolConfig.minScore >= 800 ? 'Risco Baixo' :
                 poolConfig.minScore >= 600 ? 'Risco Médio' :
                 poolConfig.minScore >= 400 ? 'Risco Alto' : 'Risco Muito Alto'}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-600" />

        <div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Aceitar empréstimos sem garantia?</Label>
              <p className="text-sm text-gray-400 mt-1">
                Empréstimos sem garantia têm maior risco, mas podem oferecer maior retorno
              </p>
            </div>
            <Switch
              checked={!poolConfig.requireCollateral}
              onCheckedChange={(checked) => setPoolConfig(prev => ({ ...prev, requireCollateral: !checked }))}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-600 h-7 w-12 data-[state=checked]:border-green-500 data-[state=unchecked]:border-slate-500 border-2"
            />
          </div>
        </div>

        {poolConfig.requireCollateral && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <Label className="text-white">Tipos de garantia aceitos</Label>
            <div className="grid grid-cols-2 gap-3">
              {collateralOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={poolConfig.acceptedCollaterals.includes(option.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPoolConfig(prev => ({
                          ...prev,
                          acceptedCollaterals: [...prev.acceptedCollaterals, option.id]
                        }));
                      } else {
                        setPoolConfig(prev => ({
                          ...prev,
                          acceptedCollaterals: prev.acceptedCollaterals.filter(id => id !== option.id)
                        }));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={option.id} 
                    className="text-white cursor-pointer flex items-center gap-2"
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Card className="bg-green-500/10 border-green-500/30 p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">
              Com esses critérios, {eligibleBorrowers} tomadores se qualificam
            </span>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Condições Financeiras</h2>
        <p className="text-gray-400">Defina a rentabilidade e prazo desejados</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-white">Taxa Mínima de Retorno (% a.a.)</Label>
          <div className="mt-4">
            <Slider
              value={[poolConfig.minReturn]}
              onValueChange={(value) => setPoolConfig(prev => ({ ...prev, minReturn: value[0] }))}
              min={12}
              max={40}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-400">12%</span>
              <span className="text-white font-medium">{poolConfig.minReturn}% a.a.</span>
              <span className="text-sm text-gray-400">40%</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-white">Prazo Máximo Aceito</Label>
          <div className="flex flex-wrap gap-3 mt-4">
            {[6, 12, 18, 24].map((months) => (
              <Button
                key={months}
                variant={poolConfig.maxTerm === months ? "default" : "outline"}
                onClick={() => setPoolConfig(prev => ({ ...prev, maxTerm: months }))}
                className={`flex-1 min-w-[80px] h-fit inline-flex items-center justify-center whitespace-normal text-center ${poolConfig.maxTerm === months 
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                  : "border-gray-600 text-gray-900 bg-white hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="break-words text-center leading-tight">
                  {months} meses
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-600" />

        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Projeção de Retorno</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Retorno estimado em 12 meses</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(estimatedReturn)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Rentabilidade efetiva</p>
                <p className="text-xl font-bold text-blue-400">
                  {poolConfig.minReturn}% a.a.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Revisão e Ativação</h2>
        <p className="text-gray-400">Confirme as configurações da sua pool</p>
      </div>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-gray-600 p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{poolConfig.name}</h3>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {formatCurrency(totalAmountValue)}
            </div>
            <p className="text-gray-400">
              Dividido em {poolConfig.loanCount} empréstimos de até {formatCurrency(maxAmountPerLoan)}
            </p>
          </div>

          <Separator className="bg-gray-600" />

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Critérios</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Score mínimo: {poolConfig.minScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">
                  {poolConfig.requireCollateral ? 'Com garantia obrigatória' : 'Aceita sem garantia'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Taxa mínima: {poolConfig.minReturn}% a.a.</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Prazo máximo: {poolConfig.maxTerm} meses</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Projeção</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Retorno estimado</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(estimatedReturn)} ({poolConfig.minReturn}% a.a.)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Tomadores elegíveis</p>
                  <p className="text-lg font-semibold text-white">~{eligibleBorrowers} atualmente</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Tempo estimado</p>
                  <p className="text-lg font-semibold text-white">5-7 dias</p>
                </div>
              </div>
            </div>
          </div>

          {totalAmountValue > 10000 && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm">
                  Valor acima de R$ 10.000 - Verificação biométrica necessária
                </span>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const renderBiometricModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Fingerprint className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Verificação Biométrica</h3>
          <p className="text-gray-400 mb-6">
            Para valores acima de R$ 10.000, é necessária verificação biométrica para segurança.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleBiometricSuccess}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Verificar Biometria
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBiometric(false)}
              className="w-full border-gray-600 text-gray-300"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-32">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Criar Pool de Investimento</h1>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Etapa {currentStep} de 4</span>
              <span className="text-gray-400">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <Progress 
              value={(currentStep / 4) * 100} 
              className="h-3 bg-gray-700/50 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-emerald-400" 
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 mt-[0px] mr-[0px] mb-[25px] ml-[0px]">
          <Card className="bg-slate-800/50 backdrop-blur-md border-gray-600 px-[14px] py-[15px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </Card>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-16 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-gray-700 mt-[-3px] mr-[0px] mb-[31px] ml-[0px] px-[29px] py-[11px]">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={
                  (currentStep === 1 && (hasInsufficientBalance || !poolConfig.name.trim() || totalAmountValue < 5000)) ||
                  (currentStep === 2 && poolConfig.requireCollateral && poolConfig.acceptedCollaterals.length === 0)
                }
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleActivatePool}
                disabled={isCreating || poolLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isCreating || poolLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando Pool...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Criar Pool
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Biometric Modal */}
      {showBiometric && renderBiometricModal()}
    </>
  );
};