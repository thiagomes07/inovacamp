import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Progress } from '../../../../components/ui/progress';
import { Badge } from '../../../../components/ui/badge';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  Shield, 
  Camera,
  FileText,
  Banknote,
  Car,
  Utensils,
  Zap,
  Trophy,
  Target,
  CheckCircle2,
  Circle,
  Info,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useScore } from '../../../shared/hooks/useScore';
import { toast } from 'sonner@2.0.3';
import { ScoreMissionCard } from './ScoreMissionCard';
import { DocumentUpload } from './DocumentUpload';
import { ScoreLevelInfo } from './ScoreLevelInfo';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
  completed: boolean;
  type: 'verification' | 'document' | 'connection' | 'payment' | 'custom';
  category?: string;
}

interface ScoreImprovementProps {
  onBack: () => void;
}

export const ScoreImprovement: React.FC<ScoreImprovementProps> = ({ onBack }) => {
  const { user, updateUserScore } = useAuth();
  const { score: currentScoreFromDB, scoreData, isLoading: scoreLoading, refresh: refreshScore } = useScore(user?.id || '');
  const [currentView, setCurrentView] = useState<'main' | 'upload' | 'levels'>('main');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'create_account',
      title: 'Criar conta',
      description: 'Concluído automaticamente ao se registrar',
      points: 10,
      icon: CheckCircle2,
      completed: true,
      type: 'verification'
    },
    {
      id: 'verify_identity',
      title: 'Verificar identidade',
      description: 'Upload de RG ou CNH para validação biométrica',
      points: 20,
      icon: Shield,
      completed: false,
      type: 'verification'
    },
    {
      id: 'connect_bank',
      title: 'Conectar conta bancária',
      description: 'Vincule sua conta via Open Finance para análise de movimentação',
      points: 50,
      icon: Banknote,
      completed: false,
      type: 'connection'
    },
    {
      id: 'income_proof',
      title: 'Enviar comprovante de renda',
      description: 'Holerite, DECORE ou DRE dos últimos 3 meses',
      points: 30,
      icon: FileText,
      completed: false,
      type: 'document'
    },
    {
      id: 'tax_declaration',
      title: 'Enviar Imposto de Renda',
      description: 'Declaração completa do último ano fiscal',
      points: 40,
      icon: FileText,
      completed: false,
      type: 'document'
    },
    {
      id: 'connect_uber',
      title: 'Conectar app Uber/99',
      description: 'Para motoristas: histórico de corridas e avaliações',
      points: 15,
      icon: Car,
      completed: false,
      type: 'connection'
    },
    {
      id: 'connect_ifood',
      title: 'Conectar app iFood/Rappi',
      description: 'Para entregadores: histórico de entregas e avaliações',
      points: 15,
      icon: Utensils,
      completed: false,
      type: 'connection'
    },
    {
      id: 'utility_bills',
      title: 'Adicionar conta de luz/telefone',
      description: 'Comprove seu endereço e histórico de pagamentos',
      points: 20,
      icon: Zap,
      completed: false,
      type: 'document'
    },
    {
      id: 'first_payment',
      title: 'Pagar 1º empréstimo em dia',
      description: 'Histórico de pagamento é fundamental para o score',
      points: 100,
      icon: Trophy,
      completed: false,
      type: 'payment'
    }
  ]);

  // Usar score do banco de dados com fallback para o do user context
  const currentScore = currentScoreFromDB || user?.score || 0;
  const completedMissions = missions.filter(m => m.completed);
  const totalEarnedPoints = completedMissions.reduce((sum, mission) => sum + mission.points, 0);
  const totalPossiblePoints = missions.reduce((sum, mission) => sum + mission.points, 0);
  const scoreProgress = (currentScore / 1000) * 100;

  const getScoreLevel = (score: number) => {
    if (score >= 900) return { name: 'Platinum', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' };
    if (score >= 750) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
    if (score >= 600) return { name: 'Silver', color: 'from-gray-300 to-gray-500', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300' };
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' };
  };

  const getCompatiblePools = (score: number) => {
    if (score >= 900) return 98;
    if (score >= 750) return 85;
    if (score >= 600) return 60;
    return 25;
  };

  const currentLevel = getScoreLevel(currentScore);
  const compatiblePools = getCompatiblePools(currentScore);

  const handleMissionComplete = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Update mission status
    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, completed: true } : m
    ));

    // Update user score
    const newScore = Math.min(1000, currentScore + mission.points);
    updateUserScore?.(newScore);

    // Show success feedback
    setShowConfetti(true);
    toast.success(`🎉 Missão concluída! +${mission.points} pontos`, {
      description: `Seu score agora é ${newScore}`
    });

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleDocumentUpload = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    setSelectedMission(mission);
    setCurrentView('upload');
  };

  const handleConnectionFlow = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    // Simulate connection flow
    toast.info(`Redirecionando para ${mission.title.toLowerCase()}...`);
    
    // Simulate successful connection after 2 seconds
    setTimeout(() => {
      handleMissionComplete(missionId);
    }, 2000);
  };

  // Confetti animation component
  const ConfettiEffect = () => {
    if (!showConfetti) return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#10B981', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444'][i % 5],
              left: `${Math.random() * 100}%`,
              top: '-10px'
            }}
            initial={{ y: -10, opacity: 1, rotate: 0 }}
            animate={{ 
              y: window.innerHeight + 10, 
              opacity: 0,
              rotate: 360,
              x: [0, (Math.random() - 0.5) * 200]
            }}
            transition={{ 
              duration: Math.random() * 2 + 1,
              delay: Math.random() * 0.5 
            }}
          />
        ))}
      </div>
    );
  };

  if (currentView === 'upload' && selectedMission) {
    return (
      <DocumentUpload
        mission={selectedMission}
        onBack={() => setCurrentView('main')}
        onSuccess={() => {
          handleMissionComplete(selectedMission.id);
          setCurrentView('main');
        }}
      />
    );
  }

  if (currentView === 'levels') {
    return (
      <ScoreLevelInfo
        currentScore={currentScore}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      <ConfettiEffect />

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
          <h1 className="text-2xl font-bold text-white">Aumentar Score</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Score Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-white/20 p-6">
            <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-r ${currentLevel.color} rounded-full flex items-center justify-center`}>
                <Star className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Seu Score: {currentScore}
              </h2>
              <Badge className={`${currentLevel.bgColor} ${currentLevel.textColor} border-none`}>
                {currentLevel.name}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Progresso</span>
                  <span className="text-gray-300">{currentScore}/1000</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={scoreProgress} 
                    className="h-5 bg-gray-500 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-green-400 [&>[data-slot=progress-indicator]]:to-blue-500 [&>[data-slot=progress-indicator]]:shadow-lg [&>[data-slot=progress-indicator]]:shadow-green-400/30"
                  />
                  {scoreProgress > 0 && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300"
                      style={{ width: `${scoreProgress}%` }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">{totalEarnedPoints}</p>
                  <p className="text-sm text-gray-400">Pontos ganhos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{totalPossiblePoints - totalEarnedPoints}</p>
                  <p className="text-sm text-gray-400">Pontos disponíveis</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pool Compatibility Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-blue-400 font-semibold">
                  💡 Você tem acesso a {compatiblePools}% das pools ativas!
                </p>
                <p className="text-gray-300 text-sm">
                  {currentScore < 750 
                    ? `Com score 750+, você teria acesso a 85% das pools com taxas melhores!`
                    : currentScore < 900
                    ? `Com score 900+, você teria acesso VIP a 98% das pools!`
                    : `Parabéns! Você tem acesso VIP a todas as pools premium!`
                  }
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                onClick={() => setCurrentView('levels')}
              >
                Ver níveis
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Mission Progress */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">Missões de Score</h2>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400 self-start sm:self-center flex-shrink-0">
                {completedMissions.length}/{missions.length} concluídas
              </Badge>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ScoreMissionCard
                    mission={mission}
                    onComplete={() => handleMissionComplete(mission.id)}
                    onUpload={() => handleDocumentUpload(mission.id)}
                    onConnect={() => handleConnectionFlow(mission.id)}
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Level Benefits Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Benefícios por Nível</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-400 font-semibold">Bronze (0-599)</span>
                </div>
                <p className="text-gray-300 text-xs">• Acesso limitado a pools básicas</p>
                <p className="text-gray-300 text-xs">• Taxas padrão</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-300 font-semibold">Silver (600-749)</span>
                </div>
                <p className="text-gray-300 text-xs">• Acesso a pools intermediárias</p>
                <p className="text-gray-300 text-xs">• Taxas moderadas</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-400 font-semibold">Gold (750-899)</span>
                </div>
                <p className="text-gray-300 text-xs">• Acesso a 85% das pools</p>
                <p className="text-gray-300 text-xs">• Taxas preferenciais</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">Platinum (900-1000)</span>
                </div>
                <p className="text-gray-300 text-xs">• Acesso VIP a todas as pools</p>
                <p className="text-gray-300 text-xs">• Taxas premium exclusivas</p>
              </div>
            </div>

            <Button 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => setCurrentView('levels')}
            >
              Ver detalhes completos
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};