import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Camera, Shield, AlertCircle } from 'lucide-react';

export const KYCFacial: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [scanStatus, setScanStatus] = useState<'ready' | 'scanning' | 'success' | 'failed'>('ready');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartScan = async () => {
    setIsLoading(true);
    setScanStatus('scanning');

    try {
      // Simulate camera access and facial recognition
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate random success/failure for demo
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        setScanStatus('success');
        toast.success('Facial verification completed successfully!');
        setTimeout(() => {
          setCurrentScreen('kyc-documents');
        }, 2000);
      } else {
        setScanStatus('failed');
        toast.error('Facial verification failed. Please try again.');
      }
    } catch (error) {
      setScanStatus('failed');
      toast.error('Camera access denied or verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setScanStatus('ready');
  };

  const handleSkip = () => {
    toast.warning('You can complete facial verification later in settings');
    setCurrentScreen('kyc-documents');
  };

  const renderScanArea = () => {
    switch (scanStatus) {
      case 'ready':
        return (
          <div className="w-64 h-64 border-4 border-dashed border-[#007AFF]/30 rounded-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-[#007AFF] mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Tap to start scan
              </p>
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="w-64 h-64 border-4 border-[#007AFF] rounded-full flex items-center justify-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 border-4 border-[#007AFF] rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="text-center z-10">
              <div className="w-16 h-16 bg-[#007AFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-[#007AFF]" />
              </div>
              <p className="text-sm text-[#007AFF]">
                Scanning...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="w-64 h-64 border-4 border-[#00C853] rounded-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#00C853]">
                Verification successful!
              </p>
            </motion.div>
          </div>
        );

      case 'failed':
        return (
          <div className="w-64 h-64 border-4 border-destructive rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-destructive">
                Verification failed
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-2">Facial Verification</h1>
        <p className="text-muted-foreground">
          Secure your account with facial recognition for enhanced security
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center space-y-8"
      >
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={scanStatus === 'ready' ? handleStartScan : undefined}
            disabled={scanStatus !== 'ready'}
            className="transition-all duration-300 hover:scale-105"
          >
            {renderScanArea()}
          </button>

          {scanStatus === 'scanning' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Keep your face in the circle
              </p>
              <div className="flex items-center justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-1 h-1 bg-[#007AFF] rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <Card className="p-6 w-full max-w-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Why we need this</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#007AFF] rounded-full mt-2" />
                  <span>Verify your identity securely</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#007AFF] rounded-full mt-2" />
                  <span>Prevent unauthorized access</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#007AFF] rounded-full mt-2" />
                  <span>Enable biometric login</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#007AFF] rounded-full mt-2" />
                  <span>Comply with financial regulations</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 space-y-3"
      >
        {scanStatus === 'ready' && (
          <Button
            onClick={handleStartScan}
            disabled={isLoading}
            className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-4 rounded-2xl"
          >
            Start Facial Scan
          </Button>
        )}

        {scanStatus === 'failed' && (
          <Button
            onClick={handleRetry}
            className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-4 rounded-2xl"
          >
            Try Again
          </Button>
        )}

        {scanStatus !== 'success' && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            Skip for Now
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen('otp-verification')}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </motion.div>
    </div>
  );
};