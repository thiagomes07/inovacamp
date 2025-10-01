import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp, User, UserRole, BorrowerType } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { Check, Eye, EyeOff } from 'lucide-react';

export const AccountCreation: React.FC = () => {
  const { setUser, setCurrentScreen } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationStates, setValidationStates] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    let isValid = false;
    switch (field) {
      case 'name':
        isValid = value.trim().length >= 2;
        break;
      case 'email':
        isValid = validateEmail(value);
        break;
      case 'phone':
        isValid = validatePhone(value);
        break;
      case 'password':
        isValid = validatePassword(value);
        break;
      case 'confirmPassword':
        isValid = value === formData.password && value.length > 0;
        break;
    }

    setValidationStates(prev => ({ ...prev, [field]: isValid }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('phone', formatted);
  };

  const handleSubmit = async () => {
    if (!Object.values(validationStates).every(Boolean)) {
      toast.error('Please fill all fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const role = localStorage.getItem('selectedRole') as UserRole;
      const borrowerType = localStorage.getItem('selectedBorrowerType') as BorrowerType;

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role,
        borrowerType: role === 'borrower' ? borrowerType : undefined,
        creditScore: Math.floor(Math.random() * 400) + 600,
        kycCompleted: false,
        biometricsEnabled: false,
        twoFactorEnabled: false,
        linkedBanks: [],
        balances: {
          fiat: role === 'lender' ? 5000 : 1200,
          stablecoin: role === 'lender' ? 1000 : 500,
          currency: 'BRL'
        }
      };

      setUser(newUser);
      toast.success('Account created successfully!');
      setCurrentScreen('otp-verification');

    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(validationStates).every(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">
          Enter your details to get started with Swapin
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 space-y-6"
      >
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pr-10 ${validationStates.name ? 'border-[#00C853]' : ''}`}
              />
              {validationStates.name && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00C853]" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pr-10 ${validationStates.email ? 'border-[#00C853]' : ''}`}
              />
              {validationStates.email && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00C853]" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`pr-10 ${validationStates.phone ? 'border-[#00C853]' : ''}`}
              />
              {validationStates.phone && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00C853]" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pr-20 ${validationStates.password ? 'border-[#00C853]' : ''}`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {validationStates.password && (
                  <Check className="w-4 h-4 text-[#00C853]" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`pr-10 ${validationStates.confirmPassword ? 'border-[#00C853]' : ''}`}
              />
              {validationStates.confirmPassword && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00C853]" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-[#007AFF] rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#007AFF] mb-1">Security Notice</p>
              <p className="text-xs text-muted-foreground">
                Your data is encrypted and secured. We'll send a verification code to your phone after account creation.
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
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-4 rounded-2xl disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen('role-selection')}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </motion.div>
    </div>
  );
};