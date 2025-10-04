import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Search,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { CreditRequestData } from './CreditRequestFlow';

interface LoanProcessingProps {
  data: CreditRequestData;
  onComplete: (approved: boolean) => void;
}

type ProcessingStage = 
  | 'analyzing-profile'
  | 'searching-pools'
  | 'matching-found'
  | 'matching-not-found'
  | 'marketplace-search'
  | 'approved'
  | 'rejected';

interface ProcessingStatus {
  stage: ProcessingStage;
  message: string;
  detail?: string;
  progress: number;
}

export const LoanProcessing: React.FC<LoanProcessingProps> = ({
  data,
  onComplete
}) => {
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'analyzing-profile',
    message: 'Analisando seu perfil...',
    progress: 0
  });

  // Define progress ranges for each stage to ensure monotonic progression
  const getProgressForStage = (stage: ProcessingStage, subProgress: number = 0): number => {
    const progressRanges = {
      'analyzing-profile': { start: 0, end: 30 },
      'searching-pools': { start: 30, end: 60 },
      'matching-found': { start: 60, end: 85 },
      'matching-not-found': { start: 60, end: 70 },
      'marketplace-search': { start: 70, end: 95 },
      'approved': { start: 95, end: 100 },
      'rejected': { start: 95, end: 100 }
    };

    const range = progressRanges[stage];
    if (!range) return 0;

    // Calculate progress within the stage range
    const stageProgress = Math.min(Math.max(subProgress, 0), 100);
    return Math.round(range.start + (range.end - range.start) * (stageProgress / 100));
  };

  useEffect(() => {
    const processLoan = async () => {
      // Stage 1: Analyzing profile (0-30%)
      setTimeout(() => {
        setStatus({
          stage: 'analyzing-profile',
          message: 'Verificando score...',
          detail: 'Analisando histórico de crédito',
          progress: getProgressForStage('analyzing-profile', 33)
        });
      }, 800);

      setTimeout(() => {
        setStatus({
          stage: 'analyzing-profile',
          message: 'Analisando histórico...',
          detail: 'Validando dados cadastrais',
          progress: getProgressForStage('analyzing-profile', 66)
        });
      }, 1600);

      setTimeout(() => {
        setStatus({
          stage: 'analyzing-profile',
          message: 'Processando...',
          detail: 'Finalizando análise de perfil',
          progress: getProgressForStage('analyzing-profile', 100)
        });
      }, 2400);

      // Stage 2: Searching pools (30-60%) - if automatic or both
      if (data.approvalType === 'automatic' || data.approvalType === 'both') {
        setTimeout(() => {
          setStatus({
            stage: 'searching-pools',
            message: 'Buscando pools compatíveis...',
            detail: 'Verificando 47 pools ativas na rede',
            progress: getProgressForStage('searching-pools', 50)
          });
        }, 3200);

        setTimeout(() => {
          setStatus({
            stage: 'searching-pools',
            message: 'Analisando compatibilidade...',
            detail: 'Verificando critérios de risco e rentabilidade',
            progress: getProgressForStage('searching-pools', 100)
          });
        }, 4000);

        // Simulate pool matching (70% success rate for demo)
        const poolMatch = Math.random() > 0.3;
        
        if (poolMatch) {
          // Pool found (60-85%)
          setTimeout(() => {
            setStatus({
              stage: 'matching-found',
              message: 'Pool compatível encontrada!',
              detail: 'Pool "Diversificação Brasil" aprovou sua solicitação',
              progress: getProgressForStage('matching-found', 100)
            });
          }, 4800);

          // Final approval (85-100%)
          setTimeout(() => {
            setStatus({
              stage: 'approved',
              message: 'Crédito aprovado!',
              detail: 'Valor creditado na sua conta',
              progress: getProgressForStage('approved', 100)
            });
            onComplete(true);
          }, 6000);
        } else {
          // Pool not found (60-70%)
          setTimeout(() => {
            setStatus({
              stage: 'matching-not-found',
              message: 'Nenhuma pool compatível encontrada',
              detail: data.approvalType === 'both' 
                ? 'Direcionando para investidores individuais...'
                : 'Tente ajustar as condições ou adicionar garantia',
              progress: getProgressForStage('matching-not-found', 100)
            });
          }, 4800);

          if (data.approvalType === 'both') {
            // Continue to marketplace (70-95%)
            setTimeout(() => {
              setStatus({
                stage: 'marketplace-search',
                message: 'Disponibilizando para investidores...',
                detail: 'Sua solicitação está no marketplace',
                progress: getProgressForStage('marketplace-search', 50)
              });
            }, 5600);

            setTimeout(() => {
              setStatus({
                stage: 'marketplace-search',
                message: 'Aguardando interesse...',
                detail: '3 investidores visualizaram sua solicitação',
                progress: getProgressForStage('marketplace-search', 100)
              });
            }, 6800);

            // Final approval (95-100%)
            setTimeout(() => {
              setStatus({
                stage: 'approved',
                message: 'Investidor encontrado!',
                detail: 'João Santos aprovou sua solicitação',
                progress: getProgressForStage('approved', 100)
              });
              onComplete(true);
            }, 8000);
          } else {
            // Rejection (95-100%)
            setTimeout(() => {
              setStatus({
                stage: 'rejected',
                message: 'Solicitação não aprovada',
                detail: 'Nenhuma pool compatível no momento',
                progress: getProgressForStage('rejected', 100)
              });
              onComplete(false);
            }, 6000);
          }
        }
      } else {
        // Manual only - direct to marketplace (30-95%)
        setTimeout(() => {
          setStatus({
            stage: 'marketplace-search',
            message: 'Disponibilizando para investidores...',
            detail: 'Sua solicitação está no marketplace',
            progress: getProgressForStage('marketplace-search', 33)
          });
        }, 3200);

        setTimeout(() => {
          setStatus({
            stage: 'marketplace-search',
            message: 'Aguardando análise...',
            detail: 'Investidores estão avaliando sua solicitação',
            progress: getProgressForStage('marketplace-search', 66)
          });
        }, 4400);

        setTimeout(() => {
          setStatus({
            stage: 'marketplace-search',
            message: 'Interesse detectado...',
            detail: '2 investidores demonstraram interesse',
            progress: getProgressForStage('marketplace-search', 100)
          });
        }, 5600);

        // Simulate manual approval (80% success rate)
        const manualMatch = Math.random() > 0.2;
        
        if (manualMatch) {
          // Approval (95-100%)
          setTimeout(() => {
            setStatus({
              stage: 'approved',
              message: 'Investidor encontrado!',
              detail: 'Maria Silva aprovou sua solicitação',
              progress: getProgressForStage('approved', 100)
            });
            onComplete(true);
          }, 6800);
        } else {
          // Rejection (95-100%)
          setTimeout(() => {
            setStatus({
              stage: 'rejected',
              message: 'Aguardando interesse',
              detail: 'Sua solicitação permanece disponível para análise',
              progress: getProgressForStage('rejected', 100)
            });
            onComplete(false);
          }, 6800);
        }
      }
    };

    processLoan();
  }, [data.approvalType, onComplete]);

  const getStageIcon = () => {
    switch (status.stage) {
      case 'analyzing-profile':
        return <Search className="w-8 h-8 text-blue-400 animate-pulse" />;
      case 'searching-pools':
        return <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />;
      case 'matching-found':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'matching-not-found':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'marketplace-search':
        return <Users className="w-8 h-8 text-purple-400 animate-pulse" />;
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />;
    }
  };

  const getStageColor = () => {
    switch (status.stage) {
      case 'approved':
      case 'matching-found':
        return 'green';
      case 'rejected':
      case 'matching-not-found':
        return 'red';
      case 'marketplace-search':
        return 'purple';
      case 'searching-pools':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const color = getStageColor();

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            {getStageIcon()}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {status.message}
          </h2>

          {/* Detail */}
          {status.detail && (
            <p className="text-gray-300 mb-6">
              {status.detail}
            </p>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
            <motion.div
              className={`h-3 rounded-full bg-gradient-to-r ${
                color === 'green' ? 'from-green-500 to-emerald-500' :
                color === 'red' ? 'from-red-500 to-red-400' :
                color === 'purple' ? 'from-purple-500 to-blue-500' :
                color === 'yellow' ? 'from-yellow-500 to-orange-500' :
                'from-blue-500 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Progress Text */}
          <p className="text-gray-400 text-sm mb-6">
            {status.progress}% concluído
          </p>

          {/* Stage-specific content */}
          {status.stage === 'searching-pools' && (
            <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Matching Automático</span>
              </div>
              <div className="text-left space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Pools verificadas:</span>
                  <span className="text-white">47/47</span>
                </div>
                <div className="flex justify-between">
                  <span>Compatibilidade:</span>
                  <span className="text-white">Analisando...</span>
                </div>
              </div>
            </div>
          )}

          {status.stage === 'matching-found' && (
            <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Pool Encontrada!</span>
              </div>
              <div className="text-left space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Pool:</span>
                  <span className="text-white">Diversificação Brasil</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa oferecida:</span>
                  <span className="text-white">{data.interestRate.toFixed(1)}% a.a.</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-400">Aprovado</span>
                </div>
              </div>
            </div>
          )}

          {status.stage === 'marketplace-search' && (
            <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">No Marketplace</span>
              </div>
              <div className="text-left space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Investidores ativos:</span>
                  <span className="text-white">234</span>
                </div>
                <div className="flex justify-between">
                  <span>Visualizações:</span>
                  <span className="text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Interesse:</span>
                  <span className="text-yellow-400">3 investidores</span>
                </div>
              </div>
            </div>
          )}

          {status.stage === 'approved' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 mb-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Sucesso!</span>
              </div>
              <div className="text-left space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Valor creditado:</span>
                  <span className="text-white font-bold">R$ {data.amount.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primeira parcela:</span>
                  <span className="text-white">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {status.stage === 'rejected' && (
            <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Não aprovado</span>
              </div>
              <p className="text-gray-300 text-sm">
                Tente ajustar as condições ou adicionar uma garantia para melhorar suas chances.
              </p>
            </div>
          )}

          {/* Loading indicator for non-final stages */}
          {!['approved', 'rejected'].includes(status.stage) && (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          )}
        </motion.div>
      </Card>
    </div>
  );
};