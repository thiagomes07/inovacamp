import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Smartphone,
  Lock,
  AlertTriangle
} from 'lucide-react';

export const BankAuthScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [step, setStep] = useState<'credentials' | 'verification' | 'success'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    password: '',
    verificationCode: ''
  });
  const [timeLeft, setTimeLeft] = useState(30);

  // Countdown timer for verification step
  useEffect(() => {
    if (step === 'verification' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const handleCredentialsSubmit = async () => {
    if (!formData.cpf || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      setStep('verification');
      toast.success('SMS code sent to your registered phone');
    }, 2000);
  };

  const handleVerificationSubmit = async () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      
      // Navigate to account selection after showing success
      setTimeout(() => {
        setCurrentScreen('account-selection');
      }, 2000);
    }, 1500);
  };

  const handleResendCode = () => {
    setTimeLeft(30);
    toast.success('New verification code sent');
  };

  const renderCredentialsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Bank Info */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">💜</div>
          <div>
            <h3 className="text-sm">Connecting to Nubank</h3>
            <p className="text-xs text-gray-600">Use your regular banking credentials</p>
          </div>
        </div>
      </Card>

      {/* Security Warning */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm text-amber-800 mb-1">Security Notice</h4>
            <p className="text-xs text-amber-700">
              Never share your banking credentials. This connection is encrypted and secure.
            </p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">CPF</label>
          <Input
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your banking password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCredentialsSubmit}
        disabled={isLoading}
        className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Secure Login
          </>
        )}
      </Button>
    </motion.div>
  );

  const renderVerificationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* SMS Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm text-blue-800">SMS Verification</h3>
            <p className="text-xs text-blue-600">Code sent to ****-**34</p>
          </div>
        </div>
      </Card>

      {/* Verification Code Input */}
      <div>
        <label className="block text-sm mb-2">Verification Code</label>
        <Input
          type="text"
          placeholder="000000"
          maxLength={6}
          value={formData.verificationCode}
          onChange={(e) => setFormData({...formData, verificationCode: e.target.value.replace(/\D/g, '')})}
          className="h-12 text-center text-lg tracking-wider"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Enter the 6-digit code sent to your phone
        </p>
      </div>

      {/* Resend Code */}
      <div className="text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-500">
            Resend code in {timeLeft}s
          </p>
        ) : (
          <button
            onClick={handleResendCode}
            className="text-sm text-[#007AFF] hover:underline"
          >
            Resend verification code
          </button>
        )}
      </div>

      <Button
        onClick={handleVerificationSubmit}
        disabled={isLoading || formData.verificationCode.length !== 6}
        className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-[#00C853] rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h3 className="text-lg mb-2">Connection Successful!</h3>
        <p className="text-sm text-gray-600">
          Your Nubank account has been securely connected
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-500"
      >
        Redirecting to account selection...
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('open-finance')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg">Bank Authentication</h1>
            <p className="text-sm text-gray-600">
              {step === 'credentials' && 'Enter your credentials'}
              {step === 'verification' && 'Verify your identity'}
              {step === 'success' && 'Connection established'}
            </p>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mt-6">
        <div className="flex items-center space-x-2">
          {['credentials', 'verification', 'success'].map((stepName, index) => (
            <React.Fragment key={stepName}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                step === stepName ? 'bg-[#007AFF] text-white' :
                ['credentials', 'verification', 'success'].indexOf(step) > index ? 'bg-[#00C853] text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {['credentials', 'verification', 'success'].indexOf(step) > index ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 rounded ${
                  ['credentials', 'verification', 'success'].indexOf(step) > index ? 'bg-[#00C853]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-[#00C853]" />
          <span>Secured by Open Finance Brasil</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        <AnimatePresence mode="wait">
          {step === 'credentials' && renderCredentialsStep()}
          {step === 'verification' && renderVerificationStep()}
          {step === 'success' && renderSuccessStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};