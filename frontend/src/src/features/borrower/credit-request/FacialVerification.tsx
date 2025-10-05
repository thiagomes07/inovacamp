import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle, Shield } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

interface FacialVerificationProps {
  onComplete: () => void;
}

export const FacialVerification: React.FC<FacialVerificationProps> = ({
  onComplete
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartVerification = () => {
    setIsVerifying(true);
    
    // Simulate facial verification process
    setTimeout(() => {
      setIsVerifying(false);
      setIsCompleted(true);
      
      // Auto advance after showing success
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 3000);
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 w-full max-w-md text-center px-[32px] py-[33px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {!isVerifying && !isCompleted && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação de Segurança
              </h2>
              
              <p className="text-gray-300 mb-6">
                Para sua segurança, precisamos confirmar sua identidade antes de processar a solicitação de crédito.
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Verificação Facial</span>
                </div>
                <p className="text-gray-300 text-sm">
                  O processo é rápido e seguro. Seus dados biométricos são criptografados e não são armazenados.
                </p>
              </div>
              
              <Button
                onClick={handleStartVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                Iniciar Verificação
              </Button>
            </>
          )}

          {isVerifying && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificando...
              </h2>
              
              <p className="text-gray-300 mb-6">
                Mantenha seu rosto centralizado na câmera
              </p>
              
              <div className="w-32 h-32 mx-auto mb-6 border-4 border-blue-500 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500/40 rounded-full" />
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⏱️ Processando verificação biométrica...
                </p>
              </div>
            </>
          )}

          {isCompleted && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação Concluída!
              </h2>
              
              <p className="text-gray-300 mb-6">
                Identidade confirmada com sucesso. Prosseguindo para as condições do empréstimo...
              </p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Verificação aprovada</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </div>
  );
};