import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useToast } from '../../shared/components/ui/Toast';
import { LoadingSpinner } from '../../shared/components/ui/LoadingSpinner';

interface LoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onBack, 
  onSuccess, 
  onForgotPassword 
}) => {
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      addToast({
        type: 'success',
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta ao Swapin'
      });
      onSuccess();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: 'Email ou senha incorretos'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-semibold text-white">Entrar</h1>
        
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* Welcome back message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Que bom te ver novamente!</h2>
            <p className="text-gray-400">Entre com sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                className={`bg-gray-800 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Sua senha"
                  className={`bg-gray-800 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 pr-12 ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
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
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <label htmlFor="remember" className="text-sm text-gray-300">
                  Lembrar-me
                </label>
              </div>
              
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};