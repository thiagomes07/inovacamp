import React from 'react';
import { motion } from 'motion/react';
import { User, Building, Briefcase } from 'lucide-react';

interface UserTypeSelectionProps {
  profileType: 'borrower' | 'lender';
  selectedType: 'individual' | 'company' | 'employee' | null;
  onSelect: (type: 'individual' | 'company' | 'employee') => void;
  onSkip: () => void;
}

export const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
  profileType,
  selectedType,
  onSelect,
  onSkip
}) => {
  // Skip this step for lenders
  if (profileType === 'lender') {
    onSkip();
    return null;
  }

  const userTypes = [
    {
      id: 'individual' as const,
      title: 'Autônomo',
      description: 'Trabalho por conta própria ou tenho renda variável',
      icon: User,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'employee' as const,
      title: 'CLT/Assalariado',
      description: 'Tenho carteira assinada ou renda fixa mensal',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'company' as const,
      title: 'Empresa',
      description: 'Represento uma pessoa jurídica',
      icon: Building,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Qual é o seu perfil?
        </h1>
        <p className="text-gray-400 text-lg">
          Isso nos ajuda a personalizar sua experiência
        </p>
      </div>

      {/* User type cards */}
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {userTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onClick={() => onSelect(type.id)}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedType === type.id 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
                <p className="text-gray-400 text-sm">{type.description}</p>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedType === type.id && (
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

      {/* Continue button */}
      {selectedType && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => onSelect(selectedType)}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-colors"
        >
          Continuar
        </motion.button>
      )}
    </div>
  );
};