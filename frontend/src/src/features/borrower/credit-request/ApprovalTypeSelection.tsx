import React from 'react';
import { motion } from 'motion/react';
import { Zap, User, Shuffle, Clock, TrendingUp, Users } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { CreditRequestData } from './CreditRequestFlow';

interface ApprovalTypeSelectionProps {
  approvalType: CreditRequestData['approvalType'];
  onUpdate: (approvalType: CreditRequestData['approvalType']) => void;
  onNext: () => void;
}

const approvalOptions = [
  {
    type: 'automatic' as const,
    title: 'Automático',
    subtitle: '⚡ Recomendado',
    icon: Zap,
    description: 'Aprovação instantânea via pools',
    features: [
      'Se seu perfil atender aos critérios, recebe na hora',
      'Dinheiro creditado imediatamente',
      'Taxa competitiva de pools diversificadas'
    ],
    pros: ['Velocidade máxima', 'Sem espera', 'Taxa otimizada'],
    timeEstimate: 'Instantâneo',
    successRate: '85%',
    color: 'green'
  },
  {
    type: 'manual' as const,
    title: 'Manual',
    subtitle: '👤 Personalizado',
    icon: User,
    description: 'Apenas investidores individuais',
    features: [
      'Pode demorar mais, mas permite condições personalizadas',
      'Investidores analisam seu perfil individualmente',
      'Possibilidade de negociar termos'
    ],
    pros: ['Condições flexíveis', 'Negociação direta', 'Análise humanizada'],
    timeEstimate: '1-3 dias',
    successRate: '70%',
    color: 'blue'
  },
  {
    type: 'both' as const,
    title: 'Ambos',
    subtitle: '🔄 Máxima chance',
    icon: Shuffle,
    description: 'Tenta pools primeiro, depois marketplace',
    features: [
      'Maximiza suas chances de aprovação',
      'Combina velocidade das pools com flexibilidade manual',
      'Se pools não aprovarem, vai para investidores individuais'
    ],
    pros: ['Melhor de dois mundos', 'Maior taxa de sucesso', 'Sem pressa'],
    timeEstimate: 'Instantâneo a 3 dias',
    successRate: '95%',
    color: 'purple'
  }
];

export const ApprovalTypeSelection: React.FC<ApprovalTypeSelectionProps> = ({
  approvalType,
  onUpdate,
  onNext
}) => {
  const handleNext = () => {
    onNext();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Escolher Tipo de Aprovação</h2>
          <p className="text-gray-300">
            Como você quer processar sua solicitação?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {approvalOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = approvalType === option.type;
            
            return (
              <motion.div
                key={option.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onUpdate(option.type)}
                  className={`w-full p-4 sm:p-5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-${option.color}-600/20 border-${option.color}-500 ring-2 ring-${option.color}-500/50`
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected 
                        ? `bg-${option.color}-500` 
                        : 'bg-gray-700'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{option.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          option.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          option.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {option.subtitle}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{option.description}</p>
                      
                      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-3 sm:flex sm:flex-col sm:space-y-2 sm:gap-0">
                        <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:bg-gray-800/30 sm:p-2 sm:rounded-lg">
                          <div className="sm:flex sm:items-center sm:gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1 sm:mx-0 sm:mb-0" />
                            <p className="text-xs text-gray-400">Tempo</p>
                          </div>
                          <p className="text-white text-xs font-semibold">{option.timeEstimate}</p>
                        </div>
                        <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:bg-gray-800/30 sm:p-2 sm:rounded-lg">
                          <div className="sm:flex sm:items-center sm:gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1 sm:mx-0 sm:mb-0" />
                            <p className="text-xs text-gray-400">Taxa de Sucesso</p>
                          </div>
                          <p className="text-white text-xs font-semibold">{option.successRate}</p>
                        </div>
                        <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:bg-gray-800/30 sm:p-2 sm:rounded-lg">
                          <div className="sm:flex sm:items-center sm:gap-2">
                            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1 sm:mx-0 sm:mb-0" />
                            <p className="text-xs text-gray-400">Avaliadores</p>
                          </div>
                          <p className="text-white text-xs font-semibold">
                            {option.type === 'automatic' ? 'Pools' : 
                             option.type === 'manual' ? 'Individuais' : 'Pools + Individuais'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-400 text-xs">{feature}</p>
                          </div>
                        ))}
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-600"
                        >
                          <h4 className="text-white font-semibold text-sm mb-3">✨ Vantagens:</h4>
                          <div className="flex flex-wrap gap-2 justify-start">
                            {option.pros.map((pro, index) => (
                              <span
                                key={index}
                                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                                  option.color === 'green' ? 'bg-green-500/10 text-green-400' :
                                  option.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-purple-500/10 text-purple-400'
                                }`}
                              >
                                {pro}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Dica</h3>
          <p className="text-gray-300 text-sm">
            A opção "Ambos" oferece a melhor experiência: você tem a chance de aprovação instantânea via pools, 
            mas se não houver match, sua solicitação segue para investidores individuais automaticamente.
          </p>
        </div>

        <Button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
        >
          Continuar
        </Button>
      </Card>
    </div>
  );
};