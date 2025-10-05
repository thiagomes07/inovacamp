import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  Clock,
  User,
  FileText,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OpportunityAnalysisProps {
  opportunity: any;
  onBack: () => void;
  onInvest: (amount: number) => void;
  availableBalance: number;
}

export const OpportunityAnalysis: React.FC<OpportunityAnalysisProps> = ({
  opportunity,
  onBack,
  onInvest,
  availableBalance
}) => {
  const [investAmount, setInvestAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversão USDC <-> BRL (1 USDC = R$ 5,15)
  const USDC_TO_BRL = parseFloat(import.meta.env.VITE_USDC_TO_BRL_RATE || '5.15');
  const BRL_TO_USDC = 1 / USDC_TO_BRL;

  // Helper function to extract numeric value from formatted string
  const getNumericValue = (value: string): number => {
    if (!value) return 0;
    // Remove $ symbol, spaces, commas and extract number
    const numbers = value.replace(/[^\d.]/g, '');
    return parseFloat(numbers) || 0;
  };

  // Conversão de BRL para USDC para exibição
  const convertBRLToUSDC = (brl: number): number => {
    return brl * BRL_TO_USDC;
  };

  // Conversão de USDC para BRL para API
  const convertUSDCToBRL = (usdc: number): number => {
    return usdc * USDC_TO_BRL;
  };

  const mockProfile = {
    profession: 'Empresário',
    income: 12000,
    experienceYears: 8,
    creditHistory: 'Excelente',
    previousLoans: 3,
    paymentHistory: '100% em dia'
  };

  const mockDocuments = [
    { name: 'CPF', verified: true },
    { name: 'RG', verified: true },
    { name: 'Comprovante de Renda', verified: true },
    { name: 'Extrato Bancário', verified: true },
    { name: 'Declaração IR', verified: false },
    { name: 'Comprovante de Residência', verified: true }
  ];

  const mockCollateral = opportunity.riskLevel === 'low' ? {
    type: 'Imóvel Comercial',
    value: 180000,
    location: 'Centro, São Paulo - SP',
    evaluation: 'Avaliação independente realizada',
    photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
  } : null;

  const handleConfirmInvestment = async () => {
    const amount = getNumericValue(investAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido para investimento');
      return;
    }
    
    if (amount > availableBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsProcessing(true);

    try {
      // Get investor ID from localStorage
      const swapinUser = localStorage.getItem('swapin_user');
      if (!swapinUser) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      const userData = JSON.parse(swapinUser);
      const investorId = userData.id;

      if (!investorId) {
        throw new Error('ID do investidor não encontrado.');
      }

      // Simulate facial verification for high amounts
      if (amount > 5000) {
        toast.info('Verificação facial necessária para valores acima de R$ 5.000');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Converter USDC para BRL para enviar ao backend
      const amountInBRL = convertUSDCToBRL(amount);

      // Call API to invest
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/credit/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investor_id: investorId,
          credit_request_id: opportunity.credit_request_id,
          amount: amountInBRL,
          interest_rate: opportunity.interest_rate || 2.5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao processar investimento');
      }

      const result = await response.json();
      console.log('Investimento realizado:', result);

      onInvest(amount);
      toast.success(`Investimento de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso!`);
      
    } catch (err: any) {
      console.error('Erro ao investir:', err);
      toast.error(err.message || 'Erro ao processar investimento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Baixo Risco';
      case 'medium': return 'Médio Risco';
      case 'high': return 'Alto Risco';
      default: return 'Não informado';
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              size="sm"
              className="border-gray-600"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Confirmar Investimento</h1>
          </div>
        </div>

        <div className="p-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 max-w-md mx-auto">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-xl font-bold">
                  {(opportunity.borrower_name || opportunity.borrower || 'U').charAt(0)}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {opportunity.borrower_name || opportunity.borrower}
                </h3>
                <p className="text-gray-400">{opportunity.purpose}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor do investimento:</span>
                  <span className="text-white font-semibold">
                    ${getNumericValue(investAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Equivalente em BRL:</span>
                  <span className="text-gray-300">
                    R$ {convertUSDCToBRL(getNumericValue(investAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de retorno:</span>
                  <span className="text-green-400 font-semibold">{opportunity.interest_rate || opportunity.rate}% a.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prazo:</span>
                  <span className="text-white font-semibold">{opportunity.duration_months || opportunity.term} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Retorno estimado:</span>
                  <span className="text-green-400 font-semibold">
                    ${(getNumericValue(investAmount) * (1 + (opportunity.interest_rate || opportunity.rate) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
              </div>

              {getNumericValue(investAmount) > 1000 && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/20 rounded-lg">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 text-sm">
                    Verificação facial será solicitada
                  </span>
                </div>
              )}

              <Button
                onClick={handleConfirmInvestment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </div>
                ) : (
                  'Confirmar Investimento'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
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
          <h1 className="text-2xl font-bold text-white">Análise de Oportunidade</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header Card */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {(opportunity.borrower_name || opportunity.borrower || 'U').charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{opportunity.borrower_name || opportunity.borrower}</h2>
                <p className="text-gray-400">{opportunity.purpose}</p>
              </div>
            </div>
            <Badge className={getRiskColor(opportunity.risk_level || opportunity.riskLevel)}>
              {getRiskLabel(opportunity.risk_level || opportunity.riskLevel)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Valor</p>
              <p className="text-white font-bold text-lg">
                R$ {opportunity.amount.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Taxa</p>
              <p className="text-green-400 font-bold text-lg">{opportunity.interest_rate || opportunity.rate}% a.a.</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Prazo</p>
              <p className="text-white font-bold text-lg">{opportunity.duration_months || opportunity.term} meses</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Score</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-blue-400 font-bold text-lg">{opportunity.score}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 h-14 p-2">
            <TabsTrigger 
              value="summary" 
              className="text-sm font-medium text-white data-[state=active]:text-gray-900 data-[state=active]:bg-white py-3 px-4 h-full"
            >
              Resumo
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="text-sm font-medium text-white data-[state=active]:text-gray-900 data-[state=active]:bg-white py-3 px-4 h-full"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="text-sm font-medium text-white data-[state=active]:text-gray-900 data-[state=active]:bg-white py-3 px-4 h-full"
            >
              Docs
            </TabsTrigger>
            <TabsTrigger 
              value="collateral" 
              className="text-sm font-medium text-white data-[state=active]:text-gray-900 data-[state=active]:bg-white py-3 px-4 h-full"
            >
              Garantia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Condições do Empréstimo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Finalidade:</span>
                  <span className="text-white">{opportunity.purpose}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Forma de pagamento:</span>
                  <span className="text-white">12 parcelas mensais</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Primeira parcela:</span>
                  <span className="text-white">30 dias após liberação</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor da parcela:</span>
                  <span className="text-white">
                    R$ {opportunity.monthly_payment_estimate ? opportunity.monthly_payment_estimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : (opportunity.amount * (1 + (opportunity.interest_rate || opportunity.rate) / 100) / (opportunity.duration_months || opportunity.term)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total a receber:</span>
                  <span className="text-green-400 font-semibold">
                    R$ {(opportunity.amount * (1 + (opportunity.interest_rate || opportunity.rate) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dados Profissionais</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Profissão:</span>
                  <span className="text-white">{mockProfile.profession}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Renda mensal:</span>
                  <span className="text-white">R$ {mockProfile.income.toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Experiência:</span>
                  <span className="text-white">{mockProfile.experienceYears} anos</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Histórico de crédito:</span>
                  <span className="text-green-400">{mockProfile.creditHistory}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Empréstimos anteriores:</span>
                  <span className="text-white">{mockProfile.previousLoans}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Histórico de pagamento:</span>
                  <span className="text-green-400">{mockProfile.paymentHistory}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Documentação Verificada</h3>
              
              <div className="space-y-3">
                {mockDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{doc.name}</span>
                    </div>
                    {doc.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    83% dos documentos verificados
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="collateral" className="space-y-4">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              {mockCollateral ? (
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">Garantia Oferecida</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo de garantia:</span>
                      <span className="text-white">{mockCollateral.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor avaliado:</span>
                      <span className="text-green-400 font-semibold">
                        R$ {mockCollateral.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Localização:</span>
                      <span className="text-white">{mockCollateral.location}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avaliação:</span>
                      <span className="text-white">{mockCollateral.evaluation}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        Garantia de {((mockCollateral.value / opportunity.amount) * 100).toFixed(0)}% do valor solicitado
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Sem Garantia</h3>
                  <p className="text-gray-400">
                    Este empréstimo não possui garantia adicional além do score de crédito.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Investment Section */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-[-11px] mt-[0px] mr-[0px] ml-[0px]">Realizar Investimento</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Valor a investir (USDC)
              </label>
              <Input
                placeholder="$ 0.00"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              <p className="text-gray-400 text-sm mt-1">
                Saldo disponível: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
              </p>
            </div>

            {investAmount && getNumericValue(investAmount) > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Retorno estimado:</span>
                  <span className="text-green-400">
                    ${(getNumericValue(investAmount) * (1 + (opportunity.interest_rate || opportunity.rate) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Lucro líquido:</span>
                  <span className="text-green-400">
                    ${(getNumericValue(investAmount) * ((opportunity.interest_rate || opportunity.rate) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={!investAmount || getNumericValue(investAmount) <= 0 || getNumericValue(investAmount) > availableBalance}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continuar Investimento
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};