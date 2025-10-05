import React from 'react';
import { 
  CheckCircle, 
  Edit, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Shield,
  Zap,
  User,
  Shuffle,
  Car,
  Home,
  Wrench,
  Receipt
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { CreditRequestData } from './CreditRequestFlow';

interface LoanReviewProps {
  data: CreditRequestData;
  onSubmit: () => void;
  onEdit: (step: 'conditions' | 'collateral' | 'approval-type') => void;
}

export const LoanReview: React.FC<LoanReviewProps> = ({
  data,
  onSubmit,
  onEdit
}) => {
  const getApprovalTypeInfo = () => {
    switch (data.approvalType) {
      case 'automatic':
        return { icon: Zap, label: 'Automático', description: 'Aprovação via pools' };
      case 'manual':
        return { icon: User, label: 'Manual', description: 'Investidores individuais' };
      case 'both':
        return { icon: Shuffle, label: 'Ambos', description: 'Pools + marketplace' };
    }
  };

  const getCollateralIcon = () => {
    if (!data.hasCollateral || !data.collateral) return null;
    
    switch (data.collateral.type) {
      case 'vehicle': return Car;
      case 'property': return Home;
      case 'equipment': return Wrench;
      case 'receivables': return Receipt;
    }
  };

  const approvalInfo = getApprovalTypeInfo();
  const ApprovalIcon = approvalInfo.icon;
  const CollateralIcon = getCollateralIcon();

  return (
    <div className="p-6 space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Revisão da Solicitação</h2>
          <p className="text-gray-300">
            Confirme todos os dados antes de enviar sua solicitação
          </p>
        </div>

        {/* Loan Conditions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Condições do Empréstimo</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit('conditions')}
              className="border-gray-600 text-slate-800 hover:text-white"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Valor Solicitado</span>
              </div>
              <p className="text-white text-xl font-bold">
                R$ {data.amount.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Parcelas</span>
              </div>
              <p className="text-white text-xl font-bold">
                {data.installments}x de R$ {data.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">Taxa de Juros</span>
              </div>
              <p className="text-white text-xl font-bold">
                {data.interestRate.toFixed(1)}% a.a.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Total a Pagar</span>
              </div>
              <p className="text-white text-xl font-bold">
                R$ {data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Collateral */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Garantia</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit('collateral')}
              className="border-gray-600 text-[rgba(0,0,0,1)]"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>

          {data.hasCollateral && data.collateral ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                {CollateralIcon && <CollateralIcon className="w-5 h-5 text-green-400" />}
                <span className="text-green-400 font-semibold">
                  {data.collateral.type === 'vehicle' ? 'Veículo' :
                   data.collateral.type === 'property' ? 'Imóvel' :
                   data.collateral.type === 'equipment' ? 'Equipamento' :
                   'Recebíveis'}
                </span>
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white font-semibold mb-2">
                Valor estimado: R$ {data.collateral.estimatedValue.toLocaleString('pt-BR')}
              </p>
              <p className="text-gray-300 text-sm mb-3">{data.collateral.description}</p>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-400">
                  📄 {data.collateral.documents.length} documento(s)
                </span>
                <span className="text-gray-400">
                  📸 {data.collateral.photos.length} foto(s)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
              <p className="text-gray-400">Nenhuma garantia oferecida</p>
            </div>
          )}
        </div>

        {/* Approval Type */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Tipo de Aprovação</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit('approval-type')}
              className="border-gray-600 text-[rgba(0,0,0,1)]"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ApprovalIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">{approvalInfo.label}</span>
            </div>
            <p className="text-gray-300 text-sm">{approvalInfo.description}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">📋 Resumo da Solicitação</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Valor solicitado:</span>
              <span className="text-white font-semibold">R$ {data.amount.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Parcelas:</span>
              <span className="text-white font-semibold">{data.installments}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taxa de juros:</span>
              <span className="text-white font-semibold">{data.interestRate.toFixed(1)}% a.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valor da parcela:</span>
              <span className="text-white font-semibold">
                R$ {data.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total a pagar:</span>
              <span className="text-white font-semibold">
                R$ {data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Garantia:</span>
              <span className="text-white font-semibold">
                {data.hasCollateral ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo de aprovação:</span>
              <span className="text-white font-semibold">{approvalInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Termos importantes</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• O valor será creditado imediatamente após aprovação</li>
            <li>• A primeira parcela vence em 30 dias</li>
            <li>• Em caso de atraso, será cobrada multa de 2% + juros</li>
            <li>• Você pode quitar antecipadamente sem penalidades</li>
            <li>• Todas as transações são registradas na blockchain</li>
          </ul>
        </div>

        <Button
          onClick={onSubmit}
          className="w-full bg-green-600 hover:bg-green-700 py-4"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Confirmar e Enviar Solicitação
        </Button>
      </Card>
    </div>
  );
};