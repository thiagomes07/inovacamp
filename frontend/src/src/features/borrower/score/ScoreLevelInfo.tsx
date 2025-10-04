import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  Shield, 
  Crown,
  Zap,
  Target,
  Award,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

interface ScoreLevelInfoProps {
  currentScore: number;
  onBack: () => void;
}

interface LevelInfo {
  name: string;
  range: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  poolAccess: number;
  benefits: string[];
  averageRate: string;
  examples: string[];
}

export const ScoreLevelInfo: React.FC<ScoreLevelInfoProps> = ({
  currentScore,
  onBack,
}) => {
  const levels: LevelInfo[] = [
    {
      name: 'Bronze',
      range: '0-599',
      minScore: 0,
      maxScore: 599,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      icon: Shield,
      poolAccess: 25,
      averageRate: '2.5-4.0%',
      benefits: [
        'Acesso limitado a pools básicas',
        'Taxas padrão do mercado',
        'Análise manual mais rigorosa',
        'Prazo de aprovação: 3-5 dias',
        'Limite inicial reduzido'
      ],
      examples: [
        'Primeiro empréstimo na plataforma',
        'Perfil sem histórico de crédito',
        'Documentação básica apenas'
      ]
    },
    {
      name: 'Silver',
      range: '600-749',
      minScore: 600,
      maxScore: 749,
      color: 'from-gray-300 to-gray-500',
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-300',
      icon: Star,
      poolAccess: 60,
      averageRate: '2.0-3.0%',
      benefits: [
        'Acesso a pools intermediárias',
        'Taxas moderadas e competitivas',
        'Análise parcialmente automatizada',
        'Prazo de aprovação: 2-3 dias',
        'Limite moderado disponível'
      ],
      examples: [
        'Histórico básico de pagamentos',
        'Documentação de renda validada',
        'Relacionamento bancário estabelecido'
      ]
    },
    {
      name: 'Gold',
      range: '750-899',
      minScore: 750,
      maxScore: 899,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400',
      icon: Award,
      poolAccess: 85,
      averageRate: '1.5-2.5%',
      benefits: [
        'Acesso à maioria das pools',
        'Taxas preferenciais exclusivas',
        'Aprovação quase automática',
        'Prazo de aprovação: 1-2 dias',
        'Limites altos disponíveis',
        'Suporte prioritário'
      ],
      examples: [
        'Histórico consistente de pagamentos',
        'Múltiplas fontes de renda validadas',
        'Score de bureau positivo',
        'Relacionamento longo com bancos'
      ]
    },
    {
      name: 'Platinum',
      range: '900-1000',
      minScore: 900,
      maxScore: 1000,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
      icon: Crown,
      poolAccess: 98,
      averageRate: '1.0-2.0%',
      benefits: [
        'Acesso VIP a todas as pools premium',
        'Taxas exclusivas mais baixas do mercado',
        'Aprovação instantânea automática',
        'Prazo de aprovação: até 24 horas',
        'Limites máximos disponíveis',
        'Gerente de conta dedicado',
        'Produtos financeiros exclusivos',
        'Early access a novas funcionalidades'
      ],
      examples: [
        'Histórico perfeito de pagamentos',
        'Múltiplas validações de alta qualidade',
        'Score de bureau excelente (850+)',
        'Patrimônio comprovado',
        'Relacionamento premium com instituições'
      ]
    }
  ];

  const getCurrentLevel = () => {
    return levels.find(level => 
      currentScore >= level.minScore && currentScore <= level.maxScore
    ) || levels[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentIndex = levels.findIndex(level => level.name === currentLevel.name);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel 
    ? ((currentScore - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
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
          <h1 className="text-2xl font-bold text-white">Níveis de Score</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Level Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`backdrop-blur-md bg-gradient-to-r ${currentLevel.bgColor} border-white/20 p-6`}>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${currentLevel.color} rounded-full flex items-center justify-center`}>
                <currentLevel.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Nível Atual: {currentLevel.name}
              </h2>
              <Badge className={`${currentLevel.bgColor} ${currentLevel.textColor} border-none`}>
                Score: {currentScore} • {currentLevel.range}
              </Badge>
            </div>

            {nextLevel && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progresso para {nextLevel.name}</span>
                  <span className="text-gray-300">
                    {nextLevel.minScore - currentScore} pontos restantes
                  </span>
                </div>
                <Progress value={progressToNext} className="h-3 bg-gray-700" />
                <p className="text-center text-sm text-gray-300">
                  Próximo nível em {nextLevel.minScore} pontos
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* All Levels Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Todos os Níveis</h2>
            </div>

            <div className="space-y-6">
              {levels.map((level, index) => {
                const isCurrentLevel = level.name === currentLevel.name;
                const isUnlocked = currentScore >= level.minScore;
                const LevelIcon = level.icon;

                return (
                  <motion.div
                    key={level.name}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`border rounded-xl p-5 transition-all duration-300 ${
                      isCurrentLevel 
                        ? `${level.bgColor} border-current`
                        : isUnlocked
                        ? 'bg-gray-800/50 border-gray-600'
                        : 'bg-gray-900/50 border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Level Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrentLevel ? level.bgColor : isUnlocked ? 'bg-gray-700/50' : 'bg-gray-800/50'
                      }`}>
                        {isUnlocked ? (
                          <LevelIcon className={`w-6 h-6 ${
                            isCurrentLevel ? level.textColor : 'text-gray-400'
                          }`} />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-600" />
                        )}
                      </div>

                      {/* Level Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className={`text-lg font-bold ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-white' : 'text-gray-500'
                            }`}>
                              {level.name}
                            </h3>
                            <p className={`text-sm ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              Score {level.range}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-green-400' : 'text-gray-500'
                            }`}>
                              {level.poolAccess}% das pools
                            </p>
                            <p className={`text-xs ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Taxa: {level.averageRate}
                            </p>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3">
                          <div>
                            <h4 className={`text-sm font-semibold mb-2 ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-white' : 'text-gray-500'
                            }`}>
                              Benefícios:
                            </h4>
                            <ul className="space-y-1">
                              {level.benefits.map((benefit, idx) => (
                                <li 
                                  key={idx}
                                  className={`text-xs flex items-center gap-2 ${
                                    isCurrentLevel ? 'text-gray-200' : isUnlocked ? 'text-gray-300' : 'text-gray-600'
                                  }`}
                                >
                                  <div className={`w-1 h-1 rounded-full ${
                                    isCurrentLevel ? level.bgColor : isUnlocked ? 'bg-gray-400' : 'bg-gray-600'
                                  }`} />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Examples */}
                          <div>
                            <h4 className={`text-sm font-semibold mb-2 ${
                              isCurrentLevel ? level.textColor : isUnlocked ? 'text-white' : 'text-gray-500'
                            }`}>
                              Como alcançar:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {level.examples.map((example, idx) => (
                                <span 
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-lg ${
                                    isCurrentLevel 
                                      ? `${level.bgColor} ${level.textColor}` 
                                      : isUnlocked 
                                      ? 'bg-gray-700/50 text-gray-300'
                                      : 'bg-gray-800/50 text-gray-600'
                                  }`}
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Current Level Badge */}
                        {isCurrentLevel && (
                          <div className="mt-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-green-400">
                              Nível Atual
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-green-400" />
              <h2 className="text-lg font-bold text-white">Dicas para Subir de Nível</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-400">📈 Aumente seu score:</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Complete todas as missões disponíveis</li>
                  <li>• Mantenha pagamentos em dia</li>
                  <li>• Valide múltiplas fontes de renda</li>
                  <li>• Conecte contas e apps externos</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-blue-400">🚀 Benefícios extras:</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Níveis mais altos = taxas menores</li>
                  <li>• Aprovação mais rápida</li>
                  <li>• Acesso a pools exclusivas</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={onBack}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              Voltar às missões
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};