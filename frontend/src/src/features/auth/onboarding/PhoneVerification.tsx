import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../../components/ui/button';
import { Smartphone, RotateCcw } from 'lucide-react';
import { OnboardingData } from '../OnboardingFlow';

interface PhoneVerificationProps {
  phone: string;
  verificationCode: string;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phone,
  verificationCode,
  onUpdate,
  onNext
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-verify when code is complete
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onUpdate({ verificationCode: fullCode });
      handleVerify(fullCode);
    }
  }, [code]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true);
    
    // TODO: POST /api/auth/verify-phone
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock verification - accept any 6-digit code
    if (codeToVerify.length === 6) {
      onNext();
    }
    
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    setCode(['', '', '', '', '', '']);
    
    // TODO: POST /api/auth/resend-sms
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mx-auto mb-8"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <Smartphone className="w-10 h-10 text-green-400" />
        </div>
      </motion.div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Verificação do celular
        </h1>
        <p className="text-gray-400 text-lg">
          Enviamos um código de 6 dígitos para
        </p>
        <p className="text-white font-semibold text-lg">{phone}</p>
      </div>

      {/* Code input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center gap-3 mb-8"
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 bg-gray-800 border-2 border-gray-600 focus:border-green-500 text-white text-center text-xl font-semibold rounded-xl transition-colors"
          />
        ))}
      </motion.div>

      {/* Resend section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-8"
      >
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reenviar código
          </button>
        ) : (
          <p className="text-gray-400">
            Reenviar código em <span className="text-white font-semibold">{countdown}s</span>
          </p>
        )}
      </motion.div>

      {/* Verify button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-auto"
      >
        <Button
          onClick={() => handleVerify(code.join(''))}
          disabled={code.join('').length !== 6 || isVerifying}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-2xl font-semibold transition-colors"
        >
          {isVerifying ? 'Verificando...' : 'Verificar código'}
        </Button>
      </motion.div>

      {/* Demo hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700"
      >
        <p className="text-xs text-gray-400 text-center">
          💡 Demo: Digite qualquer código de 6 dígitos para continuar
        </p>
      </motion.div>
    </div>
  );
};