import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Separator } from '../../../../components/ui/separator';
import { Progress } from '../../../../components/ui/progress';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { usePool } from '../../../shared/hooks/usePool';
import { useWallet } from '../../../shared/hooks/useWallet';
import { useAuth } from '../../../shared/hooks/useAuth';

interface CreatePoolScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const CreatePoolScreen: React.FC<CreatePoolScreenProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { createPool, isLoading } = usePool();
  const { balance, getTotalBalanceInBRL } = useWallet();

  const [step, setStep] = useState<1 | 2>(1);
  const [capitalInput, setCapitalInput] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 12,
    minScore: 700,
    requiresCollateral: false,
    minInterestRate: 0,
    maxTermMonths: 24,
  });

  const totalCapital = parseFloat(capitalInput) || 0;

  // Proteção contra erro no getTotalBalanceInBRL
  const brlBalance = React.useMemo(() => {
    try {
      return getTotalBalanceInBRL();
    } catch (error) {
      console.error('Erro ao obter saldo BRL:', error);
      return balance?.brl || 0;
    }
  }, [getTotalBalanceInBRL, balance]);

  console.log('CreatePoolScreen render - capitalInput:', capitalInput, 'totalCapital:', totalCapital);

  const handleSubmit = async () => {
    // Validações
    if (!formData.name.trim()) {
      toast.error('Por favor, informe o nome da pool');
      return;
    }

    if (totalCapital < 1000) {
      toast.error('O capital mínimo é R$ 1.000');
      return;
    }

    if (totalCapital > brlBalance) {
      toast.error('Saldo insuficiente na carteira');
      return;
    }

    if (formData.durationMonths <= 0) {
      toast.error('A duração deve ser maior que zero');
      return;
    }

    try {
      await createPool({
        name: formData.name,
        description: `Pool criada em ${new Date().toLocaleDateString('pt-BR')}`,
        totalCapital: totalCapital,
        maxLoansCount: 50,
        criteria: {
          minScore: formData.minScore,
          requiresCollateral: formData.requiresCollateral,
          collateralTypes: formData.requiresCollateral ? ['VEHICLE', 'PROPERTY', 'EQUIPMENT'] : [],
          minInterestRate: formData.minInterestRate,
          maxTermMonths: formData.maxTermMonths,
        },
      });

      toast.success('Pool criada com sucesso!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pool');
      console.error(error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Informações Básicas</h3>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Nome da Pool</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white mt-2"
              placeholder="Ex: Diversificação Brasil 2025"
            />
            <p className="text-xs text-gray-400 mt-1">Escolha um nome descritivo para sua pool</p>
          </div>

          <div>
            <Label className="text-white">Capital Inicial</Label>
            
            {/* Debug: Mostrar valor atual */}
            <div className="text-xs text-yellow-400 mb-2 p-2 bg-yellow-900/20 rounded">
              Debug: capitalInput = "{capitalInput}" | totalCapital = {totalCapital}
              <button 
                onClick={() => setCapitalInput('12345')} 
                className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs"
              >
                Testar setCapitalInput('12345')
              </button>
            </div>
            
            <div className="relative mt-2">
              <input
                type="text"
                inputMode="numeric"
                value={capitalInput}
                onChange={(e) => {
                  console.log('onChange disparado:', e.target.value);
                  setCapitalInput(e.target.value);
                }}
                onInput={(e) => {
                  console.log('onInput disparado:', (e.target as HTMLInputElement).value);
                }}
                onClick={() => console.log('Input clicado')}
                onFocus={() => console.log('Input focado')}
                className="flex h-9 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-1 text-base text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder="Mínimo R$ 1.000"
              />
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Capital que será alocado para empréstimos</p>
                <p className="text-xs text-green-400 font-semibold">Disponível: {formatCurrency(brlBalance)}</p>
              </div>
              {balance?.usdc > 0 && (
                <div className="text-xs text-gray-500 text-right">
                  (BRL {formatCurrency(balance.brl)} + USDC {balance.usdc.toFixed(2)} × 5.15)
                </div>
              )}
              {totalCapital > 0 && totalCapital < 1000 && (
                <p className="text-xs text-orange-400 text-right">
                  ⚠️ Valor mínimo: R$ 1.000
                </p>
              )}
              {totalCapital > brlBalance && (
                <p className="text-xs text-red-400 text-right">
                  ⚠️ Saldo insuficiente
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCapitalInput((brlBalance * 0.25).toString())}
              className="border-gray-600 text-gray-300"
            >
              25%
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCapitalInput((brlBalance * 0.50).toString())}
              className="border-gray-600 text-gray-300"
            >
              50%
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCapitalInput((brlBalance * 0.75).toString())}
              className="border-gray-600 text-gray-300"
            >
              75%
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCapitalInput(brlBalance.toString())}
              className="border-gray-600 text-gray-300"
            >
              100%
            </Button>
          </div>

          <div>
            <Label className="text-white">Duração da Pool (meses)</Label>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[6, 12, 18, 24].map((months) => (
                <Button
                  key={months}
                  type="button"
                  variant={formData.durationMonths === months ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, durationMonths: months }))}
                  className={formData.durationMonths === months 
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                >
                  {months} meses
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Tempo que a pool ficará ativa</p>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-600" />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-gray-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={!formData.name || totalCapital < 1000}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Próximo: Critérios
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Critérios de Elegibilidade</h3>
        <p className="text-gray-400 text-sm mb-6">
          Defina os critérios que os tomadores devem atender para acessar sua pool
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Score Mínimo</Label>
            <Input
              type="number"
              min="0"
              max="850"
              value={formData.minScore ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 850) {
                  setFormData(prev => ({ ...prev, minScore: value }));
                }
              }}
              className="bg-gray-800 border-gray-600 text-white mt-2"
              placeholder="Ex: 700"
            />
            <p className="text-xs text-gray-400 mt-1">Score de crédito mínimo (0-850, 0 = sem mínimo)</p>
          </div>

          <div>
            <Label className="text-white">Prazo Máximo Aceito (meses)</Label>
            <Input
              type="number"
              min="0"
              max="60"
              value={formData.maxTermMonths ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 60) {
                  setFormData(prev => ({ ...prev, maxTermMonths: value }));
                }
              }}
              className="bg-gray-800 border-gray-600 text-white mt-2"
              placeholder="Ex: 24"
            />
            <p className="text-xs text-gray-400 mt-1">Prazo máximo para empréstimos (0 = sem limite)</p>
          </div>

          <div>
            <Label className="text-white">Taxa Mínima Aceita (% a.a.)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.minInterestRate ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setFormData(prev => ({ ...prev, minInterestRate: value }));
                }
              }}
              className="bg-gray-800 border-gray-600 text-white mt-2"
              placeholder="Ex: 15.0"
            />
            <p className="text-xs text-gray-400 mt-1">Taxa de juros mínima (0% = sem mínimo)</p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <input
              type="checkbox"
              id="requireCollateral"
              checked={formData.requiresCollateral}
              onChange={(e) => setFormData(prev => ({ ...prev, requiresCollateral: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="requireCollateral" className="text-white cursor-pointer flex-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Exigir garantia (colateral)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Aceitar apenas empréstimos com garantia (veículos, imóveis, equipamentos)
              </p>
            </Label>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-600" />

      {/* Resumo */}
      <Card className="bg-blue-500/10 border-blue-500/30 p-4">
        <div className="flex items-start gap-2">
          <Target className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-400 mb-2">Resumo da Pool</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p><strong>Nome:</strong> {formData.name}</p>
              <p><strong>Capital:</strong> {formatCurrency(totalCapital)}</p>
              <p><strong>Duração:</strong> {formData.durationMonths} meses</p>
              <p><strong>Score mínimo:</strong> {formData.minScore || 'Sem mínimo'}</p>
              <p><strong>Taxa mínima:</strong> {formData.minInterestRate}% a.a.</p>
              <p><strong>Prazo máximo:</strong> {formData.maxTermMonths || 'Sem limite'} meses</p>
              <p><strong>Garantia:</strong> {formData.requiresCollateral ? 'Obrigatória' : 'Opcional'}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-yellow-400 mb-1">Atenção</p>
            <p>
              O valor de <strong>{formatCurrency(totalCapital)}</strong> será debitado 
              da sua carteira e ficará disponível para empréstimos que atendam seus critérios.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 border-gray-600"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Criando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Criar Pool
            </>
          )}
        </Button>
      </div>
    </div>
  );

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
          <div>
            <h1 className="text-2xl font-bold text-white">Criar Nova Pool</h1>
            <p className="text-gray-400 text-sm">Configure sua pool de investimentos</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Passo {step} de 2</span>
          <span className="text-sm text-gray-400">{step === 1 ? 'Informações Básicas' : 'Critérios'}</span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-md border-gray-600 p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
