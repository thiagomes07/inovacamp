import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { 
  CheckCircle,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Building2
} from 'lucide-react';

export const DepositProcessingScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      id: 'initiated',
      title: 'Transfer Initiated',
      description: 'Your transfer request has been received',
      icon: Clock,
      color: '#007AFF'
    },
    {
      id: 'bank-processing',
      title: 'Bank Processing',
      description: 'Nubank is processing your transfer',
      icon: Building2,
      color: '#8A2BE2'
    },
    {
      id: 'verification',
      title: 'Security Verification',
      description: 'Verifying transaction authenticity',
      icon: Shield,
      color: '#00C853'
    },
    {
      id: 'conversion',
      title: 'Currency Conversion',
      description: 'Converting BRL to USDC at current rate',
      icon: ArrowRight,
      color: '#FFD700'
    },
    {
      id: 'completed',
      title: 'Transfer Complete',
      description: 'USDC has been added to your wallet',
      icon: CheckCircle,
      color: '#00C853'
    }
  ];

  useEffect(() => {
    const stepDuration = 1500; // 1.5 seconds per step
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          setProgress((prev + 1) * (100 / steps.length));
          return prev + 1;
        } else {
          // Transfer completed, navigate to success screen
          setTimeout(() => {
            setCurrentScreen('deposit-success');
          }, 1000);
          return prev;
        }
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [setCurrentScreen]);

  // Update progress bar smoothly
  useEffect(() => {
    const targetProgress = (currentStep + 1) * (100 / steps.length);
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(progressTimer);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#007AFF] to-[#00C853] px-6 pt-12 pb-8">
        <div className="text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="w-8 h-8" />
          </motion.div>
          
          <h1 className="text-xl mb-2">Processing Deposit</h1>
          <p className="text-white/80 text-sm">
            Your transfer is being processed securely
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-white/20"
          />
        </div>
      </div>

      {/* Processing Steps */}
      <div className="px-6 mt-8 space-y-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 transition-all duration-500 ${
                isCompleted 
                  ? 'border-[#00C853] bg-[#00C853]/5' 
                  : isCurrent 
                    ? 'border-[#007AFF] bg-[#007AFF]/5' 
                    : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-[#00C853]' 
                        : isCurrent 
                          ? 'bg-[#007AFF]' 
                          : 'bg-gray-300'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isCompleted || isCurrent ? 'text-foreground' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-[#00C853] rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6"
                    >
                      <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Transfer Details */}
      <div className="px-6 mt-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm text-blue-800 mb-3">Transfer Details</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>From:</span>
              <span>Nubank (****-1234)</span>
            </div>
            <div className="flex justify-between">
              <span>To:</span>
              <span>Swapin Wallet</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span>Open Finance</span>
            </div>
            <div className="flex justify-between">
              <span>Security:</span>
              <span>256-bit SSL Encryption</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Estimated Time */}
      <div className="px-6 mt-6">
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-800">Estimated completion time</p>
              <p className="text-xs text-gray-600">Usually takes 5-10 seconds</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
};