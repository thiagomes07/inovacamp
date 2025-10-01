import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export const OnboardingComplete: React.FC = () => {
  const { user, setCurrentScreen } = useApp();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      setCurrentScreen('home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [setCurrentScreen]);

  const handleGetStarted = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen swapin-gradient flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full transform translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full transform -translate-x-16 translate-y-16"></div>
      <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-emerald-500/5 rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/25"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h1 className="text-white text-4xl font-bold mb-4">
            Bem-vindo ao Swapin!
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Sua conta está pronta e verificada
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        <Card className="swapin-glass p-8 backdrop-blur-xl">
          <div className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{user?.creditScore || 750}</div>
                <div className="text-xs text-white/60">Credit Score</div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs mt-1">
                  Excelente
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">R$ {user?.balances?.fiat?.toLocaleString() || '1,200'}</div>
                <div className="text-xs text-white/60">Saldo Inicial</div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs mt-1">
                  Disponível
                </Badge>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Status da Conta</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400">Verificada</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Tipo de Usuário</span>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {user?.role === 'borrower' ? 'Tomador' : 'Emprestador'}
                </Badge>
              </div>
              {user?.borrowerType && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Perfil</span>
                  <Badge variant="outline" className="border-white/30 text-white/80">
                    {user.borrowerType === 'autonomous' ? 'Autônomo' : 
                     user.borrowerType === 'clt' ? 'CLT' : 'Empresa'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="swapin-glass p-8 backdrop-blur-xl">
          <h3 className="mb-6 text-center text-white text-lg font-semibold">Próximos Passos</h3>
          <div className="space-y-4">
            {user?.role === 'borrower' ? (
              <>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-white/90">Solicite seu primeiro crédito</span>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white/70 text-sm">2</div>
                  <span className="text-white/70">Faça pagamentos PIX com crédito</span>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white/70 text-sm">3</div>
                  <span className="text-white/70">Troque moedas globalmente</span>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-white/90">Crie pools de investimento</span>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white/70 text-sm">2</div>
                  <span className="text-white/70">Analise solicitações de crédito</span>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white/70 text-sm">3</div>
                  <span className="text-white/70">Ganhe retornos em investimentos</span>
                </motion.div>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.6 }}
        className="w-full max-w-sm mt-8 relative z-10"
      >
        <Button
          onClick={handleGetStarted}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 rounded-2xl shadow-2xl shadow-emerald-500/25 border-0 text-lg font-semibold"
        >
          <motion.span
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center"
          >
            Começar Agora
          </motion.span>
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="text-center mt-8"
        >
          <p className="text-white/70 text-sm mb-4">
            Modernos por natureza, invencíveis por opção
          </p>
          <div className="flex justify-center space-x-1 mb-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-emerald-400/60 rounded-full"
              />
            ))}
          </div>
          <p className="text-white/50 text-xs">
            Redirecionando em 5 segundos...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};