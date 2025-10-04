import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { OnboardingData } from '../OnboardingFlow';

interface BasicInfoProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

interface ValidationState {
  name: boolean;
  email: boolean;
  password: boolean;
  phone: boolean;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ data, onUpdate, onNext }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    name: false,
    email: false,
    password: false,
    phone: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateName = (name: string) => {
    return name.length >= 3;
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    setPasswordStrength(strength);
    return strength >= 3;
  };

  const validatePhone = (phone: string) => {
    return phone.replace(/\D/g, '').length === 11;
  };

  useEffect(() => {
    setValidation({
      name: validateName(data.name),
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      phone: validatePhone(data.phone)
    });
  }, [data]);

  const isFormValid = Object.values(validation).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Fraca';
    if (passwordStrength === 2) return 'Média';
    if (passwordStrength === 3) return 'Boa';
    return 'Forte';
  };

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Seus dados básicos
        </h1>
        <p className="text-gray-400 text-lg">
          Vamos criar sua conta no Swapin
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Name */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome completo
          </label>
          <div className="relative">
            <Input
              type="text"
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Seu nome completo"
              className={`bg-gray-800 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 pr-10 ${
                data.name ? (validation.name ? 'border-green-500' : 'border-red-500') : 'border-gray-600'
              }`}
            />
            {data.name && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {validation.name ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {data.name && !validation.name && (
            <p className="text-red-400 text-sm mt-1">Nome deve ter pelo menos 3 caracteres</p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="seu@email.com"
              className={`bg-gray-800 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 pr-10 ${
                data.email ? (validation.email ? 'border-green-500' : 'border-red-500') : 'border-gray-600'
              }`}
            />
            {data.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {validation.email ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {data.email && !validation.email && (
            <p className="text-red-400 text-sm mt-1">Email inválido</p>
          )}
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Senha
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              placeholder="Crie uma senha segura"
              className={`bg-gray-800 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 pr-10 ${
                data.password ? (validation.password ? 'border-green-500' : 'border-red-500') : 'border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {data.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                passwordStrength >= 3 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                Senha {getPasswordStrengthText()}
              </p>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-400">
            <p>• Mínimo 8 caracteres</p>
            <p>• Pelo menos 1 letra maiúscula</p>
            <p>• Pelo menos 1 número</p>
          </div>
        </motion.div>

        {/* Phone */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Celular
          </label>
          <MaskedInput
            mask="phone"
            value={data.phone}
            onChange={(value) => onUpdate({ phone: value })}
            isValid={data.phone ? validation.phone : undefined}
          />
          {data.phone && !validation.phone && (
            <p className="text-red-400 text-sm mt-1">Número de celular inválido</p>
          )}
        </motion.div>

        {/* Submit button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-2xl font-semibold transition-colors"
          >
            Continuar
          </Button>
        </motion.div>
      </form>
    </div>
  );
};