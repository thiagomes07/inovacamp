import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, TrendingUp } from 'lucide-react';

interface ProfileSelectionProps {
  selectedProfile: 'borrower' | 'lender' | null;
  onSelect: (profile: 'borrower' | 'lender') => void;
}

export const ProfileSelection: React.FC<ProfileSelectionProps> = ({ 
  selectedProfile, 
  onSelect 
}) => {
  const profiles = [
    {
      id: 'borrower' as const,
      title: 'Preciso de crédito',
      description: 'Solicite empréstimos com taxas justas e aprovação rápida',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600',
      benefits: [
        'Aprovação em minutos',
        'Taxas competitivas',
        'Score gamificado',
        'Sem burocracia'
      ]
    },
    {
      id: 'lender' as const,
      title: 'Quero investir',
      description: 'Invista diretamente em pessoas e empresas com segurança',
      icon: TrendingUp,
      color: 'from-blue-500 to-purple-600',
      benefits: [
        'Rendimentos atrativos',
        'Diversificação automática',
        'Investimento global',
        'Transparência total'
      ]
    }
  ];

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Como você pretende usar o Swapin?
        </h1>
        <p className="text-gray-400 text-lg">
          Escolha o perfil que melhor se adequa aos seus objetivos
        </p>
      </div>

      {/* Profile cards */}
      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {profiles.map((profile, index) => (
          <motion.button
            key={profile.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onClick={() => onSelect(profile.id)}
            className={`
              relative p-6 rounded-3xl border-2 transition-all duration-300 text-left
              ${selectedProfile === profile.id 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              }
            `}
          >
            {/* Icon and title */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${profile.color} flex items-center justify-center`}>
                <profile.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{profile.title}</h3>
                <p className="text-gray-400 text-sm">{profile.description}</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2">
              {profile.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Selection indicator */}
            {selectedProfile === profile.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-gray-500 text-sm">
          💡 Você poderá alterar seu perfil depois, se necessário
        </p>
      </motion.div>
    </div>
  );
};