import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../../components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { OnboardingData } from '../OnboardingFlow';

interface OnboardingSuccessProps {
  userData: OnboardingData;
  onComplete: () => void;
}

export const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ 
  userData, 
  onComplete 
}) => {
  const { register } = useAuth();

  useEffect(() => {
    // Register user with collected data
    const registerUser = async () => {
      if (userData.profileType && userData.name && userData.email && userData.password && userData.phone) {
        try {
          await register({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            profileType: userData.profileType,
            userType: userData.userType || 'individual'
          });
        } catch (error) {
          console.error('Registration error:', error);
        }
      }
    };

    registerUser();
  }, [userData, register]);

  // Confetti animation
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['#10B981', '#3B82F6', '#A855F7', '#F59E0B'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="px-6 py-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -100, 
            x: `${piece.x}%`, 
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: 800, 
            rotate: 360 * 2,
            opacity: 0 
          }}
          transition={{ 
            duration: piece.duration, 
            delay: piece.delay,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}

      {/* Success content */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="text-center z-10"
      >
        {/* Success icon with sparkles */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              delay: 0.3 
            }}
            className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>

          {/* Sparkles around icon */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                delay: 0.5 + (i * 0.1),
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute"
              style={{
                left: `${50 + 60 * Math.cos((i * Math.PI * 2) / 8)}%`,
                top: `${50 + 60 * Math.sin((i * Math.PI * 2) / 8)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Welcome message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Bem-vindo ao Swapin!
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Olá, {userData.name}! 👋
          </p>
          <p className="text-gray-400 mb-8">
            Sua conta foi criada com sucesso e você já pode começar a usar nossa plataforma
          </p>
        </motion.div>

        {/* Features unlocked */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 gap-4 mb-8 max-w-md"
        >
          {userData.profileType === 'borrower' ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-sm">Solicitar empréstimos desbloqueado</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-blue-400 text-sm">Score gamificado ativado</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-purple-400 text-sm">Carteira digital criada</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-sm">Investimentos P2P desbloqueados</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-blue-400 text-sm">Pools automatizadas disponíveis</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-purple-400 text-sm">Carteira multi-moeda criada</span>
              </div>
            </>
          )}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105"
          >
            Começar a usar o Swapin
          </Button>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8"
        >
          <p className="text-gray-500 text-sm italic">
            "Modernos por natureza, invencíveis por opção"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};