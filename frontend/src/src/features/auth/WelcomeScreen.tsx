import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/ui/button';
import { TrendingUp, Users, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 mt-[0px] mr-[0px] mb-[-57px] ml-[0px]">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold text-white text-center mb-4"
        >
          Bem-vindo ao Swapin
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl text-gray-300 text-center mb-12 max-w-md"
        >
          Sua plataforma para transações globais peer-to-peer, acesso justo ao crédito e integração perfeita com crypto
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl"
        >
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Investimentos P2P</h3>
            <p className="text-gray-400 text-sm">Conecte-se diretamente com tomadores e aumente seus rendimentos</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Pools Automatizadas</h3>
            <p className="text-gray-400 text-sm">Diversifique automaticamente com nosso sistema inteligente</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Blockchain Seguro</h3>
            <p className="text-gray-400 text-sm">Transações seguras e transparentes com tecnologia blockchain</p>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="px-6 pb-8 space-y-3"
      >
        <Button 
          onClick={onGetStarted}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-2xl"
        >
          Criar Conta
        </Button>
        
        <Button 
          onClick={onLogin}
          variant="outline"
          className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 py-4 text-lg rounded-2xl"
        >
          Já tenho conta
        </Button>
      </motion.div>
    </div>
  );
};