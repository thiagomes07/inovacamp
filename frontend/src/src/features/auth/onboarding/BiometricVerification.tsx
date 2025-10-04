import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../../components/ui/button';
import { Scan, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';

interface BiometricVerificationProps {
  onComplete: (biometricData: any) => void;
  onSkip?: () => void;
}

type VerificationStep = 'center' | 'left' | 'right' | 'smile' | 'processing' | 'complete';

export const BiometricVerification: React.FC<BiometricVerificationProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('center');
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const steps = [
    {
      id: 'center' as const,
      title: 'Posicione seu rosto',
      description: 'Olhe diretamente para a câmera',
      icon: Scan,
      instruction: 'Mantenha o rosto centralizado no círculo'
    },
    {
      id: 'left' as const,
      title: 'Vire para a esquerda',
      description: 'Vire suavemente a cabeça para a esquerda',
      icon: ArrowLeft,
      instruction: 'Mostre o lado esquerdo do seu rosto'
    },
    {
      id: 'right' as const,
      title: 'Vire para a direita',
      description: 'Agora vire para a direita',
      icon: ArrowRight,
      instruction: 'Mostre o lado direito do seu rosto'
    },
    {
      id: 'smile' as const,
      title: 'Sorria!',
      description: 'Um sorriso natural para finalizar',
      icon: Scan,
      instruction: 'Sorria naturalmente olhando para a câmera'
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  useEffect(() => {
    if (currentStep === 'processing') {
      // Simulate processing
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCurrentStep('complete');
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 'complete') {
      const timer = setTimeout(() => {
        onComplete({ verified: true, timestamp: new Date().toISOString() });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const handleStepComplete = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    } else {
      setCurrentStep('processing');
    }
  };

  const handleStart = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStepComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetry = () => {
    setCurrentStep('center');
    setProgress(0);
  };

  if (currentStep === 'processing') {
    return (
      <div className="px-6 py-8 h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="w-24 h-24 border-4 border-gray-600 rounded-full" />
            <motion.div
              className="absolute inset-0 border-4 border-green-500 rounded-full"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + (progress / 100) * 50}% 0%, ${50 + (progress / 100) * 50}% 100%, 50% 100%)`
              }}
            />
            <div className="absolute inset-2 bg-green-500/20 rounded-full flex items-center justify-center">
              <Scan className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Processando...</h2>
          <p className="text-gray-400 mb-4">Analisando suas características biométricas</p>
          <p className="text-green-400 font-semibold">{progress}%</p>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="px-6 py-8 h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✓
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Verificação concluída!</h2>
          <p className="text-gray-400">Sua identidade foi verificada com sucesso</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                steps.findIndex(s => s.id === currentStep) >= index
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Verificação facial
        </h1>
        <p className="text-gray-400 text-lg">
          Vamos verificar sua identidade de forma segura
        </p>
      </div>

      {/* Camera interface */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        {countdown > 0 ? (
          /* Countdown */
          <motion.div
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center"
          >
            <div className="w-32 h-32 border-4 border-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-white">{countdown}</span>
            </div>
            <p className="text-gray-400">Prepare-se...</p>
          </motion.div>
        ) : (
          /* Step interface */
          <motion.div
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Face circle */}
            <div className="relative mb-6">
              <div className="w-48 h-48 border-4 border-green-500 rounded-full mx-auto relative overflow-hidden">
                {/* Face placeholder */}
                <div className="absolute inset-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  {currentStepData && <currentStepData.icon className="w-12 h-12 text-green-400" />}
                </div>
                
                {/* Direction indicators */}
                {currentStep === 'left' && (
                  <motion.div
                    animate={{ x: [-10, 0, -10] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2"
                  >
                    <ArrowLeft className="w-6 h-6 text-green-400" />
                  </motion.div>
                )}
                
                {currentStep === 'right' && (
                  <motion.div
                    animate={{ x: [10, 0, 10] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2"
                  >
                    <ArrowRight className="w-6 h-6 text-green-400" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Instructions */}
            {currentStepData && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-400 mb-1">{currentStepData.description}</p>
                <p className="text-sm text-gray-500">{currentStepData.instruction}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {countdown > 0 ? (
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              A verificação iniciará automaticamente
            </p>
            {/* Skip button during countdown */}
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
                className="w-full border-gray-600 text-white bg-gray-800/50 hover:bg-gray-700 hover:text-white py-3 rounded-2xl font-medium transition-colors"
              >
                Pular verificação facial
              </Button>
            )}
          </div>
        ) : (
          <>
            <Button
              onClick={handleStepComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-colors"
            >
              {currentStepData?.title === 'Sorria!' ? 'Finalizar' : 'Próximo'}
            </Button>
            
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recomeçar
            </Button>
          </>
        )}
      </motion.div>

      {/* Demo and Skip buttons */}
      {countdown === 0 && (
        <div className="flex flex-col items-center gap-3 mt-4">
          <button
            onClick={handleStart}
            className="text-green-400 hover:text-green-300 text-sm transition-colors"
          >
            💡 Demo: Iniciar verificação automática
          </button>
          
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-3 rounded-2xl font-medium transition-colors"
            >
              Pular verificação facial
            </Button>
          )}
        </div>
      )}
    </div>
  );
};