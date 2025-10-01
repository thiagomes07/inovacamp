import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner@2.0.3';

export const OTPVerification: React.FC = () => {
  const { user, setCurrentScreen } = useApp();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Auto-submit when 6 digits are entered
      setTimeout(() => handleVerify(value), 100);
    }
  };

  const handleVerify = async (otpValue = otp) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, accept any 6-digit code
      toast.success('Phone number verified successfully!');
      setCurrentScreen('kyc-facial');

    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResendTimer(60);
      setCanResend(false);
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  const maskedPhone = user?.phone ? 
    user.phone.replace(/(\(\d{2}\))\s(\d{4,5})-(\d{4})/, '$1 ****-$3') : 
    '(11) ****-9999';

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-2">Verify Your Phone</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to {maskedPhone}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center space-y-8"
      >
        <Card className="p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#007AFF]"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the verification code
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleOTPChange}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <div className="mx-2">-</div>
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <div className="w-4 h-4 border-2 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Verifying...</span>
            </motion.div>
          )}

          <div className="text-center">
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResend}
                className="text-[#007AFF] p-0 h-auto"
              >
                Resend code
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in {resendTimer}s
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 w-full max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 9v4l2 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">
                Code expires in 10 minutes
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Didn't receive it? Check your SMS or request a new code
              </p>
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
        <Button
          onClick={() => handleVerify()}
          disabled={otp.length !== 6 || isLoading}
          className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-4 rounded-2xl disabled:opacity-50"
        >
          Verify & Continue
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen('account-creation')}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </motion.div>
    </div>
  );
};