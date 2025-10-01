import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <div className="min-h-screen swapin-gradient flex flex-col px-6 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-blue-900/10" />
      <div className="absolute top-20 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center items-center relative z-10"
      >
        {/* Swapin Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/25"
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
              fill="white"
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-6 text-white">
            Bem-vindo ao Swapin
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md font-light">
            Sua plataforma para transações globais peer-to-peer, acesso justo ao crédito e integração perfeita com crypto.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="swapin-glass p-6 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-white/90 font-medium">
                Modernos por natureza, invencíveis por opção
              </p>
            </div>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>Transações P2P globais</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>Acesso justo ao crédito</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>Carteiras crypto integradas</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>Empréstimos e investimentos</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        <Button
          onClick={() => setCurrentScreen('role-selection')}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 rounded-2xl shadow-2xl shadow-emerald-500/25 border-0 text-lg font-semibold"
        >
          <motion.span
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center"
          >
            Começar
          </motion.span>
        </Button>

        <p className="text-center text-xs text-white/60 mt-6 leading-relaxed">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </motion.div>
    </div>
  );
};